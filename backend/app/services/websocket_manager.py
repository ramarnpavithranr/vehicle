import json
import logging
from typing import List, Dict, Any, Set
from fastapi import WebSocket
from app.services.proximity import haversine_distance_meters

logger = logging.getLogger("AutoPulse.WebSocket")

class ConnectionManager:
    def __init__(self):
        # Active connections list
        self.active_connections: List[WebSocket] = []
        # Client metadata map (socket -> client_info dict)
        self.client_info: Dict[WebSocket, Dict[str, Any]] = {}
        # Deduplication cache: set of (vehicle_id, hazard_id)
        self.dispatched_alerts: Set[str] = set()

    async def connect(self, websocket: WebSocket, client_type: str = "dashboard", vehicle_id: int | None = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        self.client_info[websocket] = {
            "type": client_type,
            "vehicle_id": vehicle_id,
            "lat": None,
            "lng": None
        }
        logger.info(f"WebSocket client connected. Total connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if websocket in self.client_info:
            del self.client_info[websocket]
        logger.info(f"WebSocket client disconnected. Total connections: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients."""
        payload = json.dumps(message)
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception as e:
                logger.warning(f"Error sending message to client: {e}")
                dead_connections.append(connection)
        
        for dead in dead_connections:
            self.disconnect(dead)

    async def broadcast_hazard_event(self, event_type: str, hazard_data: dict):
        """
        Broadcasts hazard lifecycle events:
        - HAZARD_DETECTED
        - HAZARD_VERIFIED
        - HAZARD_CONFIRMED (Triggers V2V proximity warnings)
        - HAZARD_CLEARED
        - HAZARD_REJECTED
        """
        event = {
            "type": event_type,
            "hazard": hazard_data,
            "timestamp": hazard_data.get("updated_at") or hazard_data.get("created_at")
        }
        await self.broadcast(event)

    async def dispatch_v2v_proximity_alert(
        self, 
        hazard: dict, 
        vehicles: List[dict], 
        radius_meters: float = 1000.0
    ) -> List[dict]:
        """
        Calculates which vehicles are within radius_meters of the confirmed hazard
        and dispatches high-priority V2V warning packets.
        Deduplicates so vehicles aren't spammed for the same hazard.
        """
        h_lat = hazard["latitude"]
        h_lng = hazard["longitude"]
        h_id = hazard["id"]
        h_type = hazard["type"]
        h_sev = hazard["severity"]
        
        generated_alerts = []
        
        for v in vehicles:
            v_id = v["id"]
            v_lat = v["latitude"]
            v_lng = v["longitude"]
            v_name = v.get("name", f"Vehicle #{v_id}")
            
            dedup_key = f"{v_id}:{h_id}"
            if dedup_key in self.dispatched_alerts:
                continue
            
            dist = haversine_distance_meters(h_lat, h_lng, v_lat, v_lng)
            if dist <= radius_meters:
                # Mark as dispatched
                self.dispatched_alerts.add(dedup_key)
                
                alert_packet = {
                    "type": "V2V_ALERT",
                    "hazard_id": h_id,
                    "hazard_type": h_type,
                    "severity": h_sev,
                    "distance_meters": dist,
                    "vehicle_id": v_id,
                    "vehicle_name": v_name,
                    "coordinates": {"lat": h_lat, "lng": h_lng},
                    "message": f"DANGER: {h_type.replace('_', ' ').upper()} detected {int(dist)}m ahead! Reduce speed.",
                    "voice_message": f"Caution. {h_type.replace('_', ' ')} detected {int(dist)} meters ahead.",
                    "timestamp": hazard.get("updated_at")
                }
                generated_alerts.append(alert_packet)
                # Broadcast alert packet immediately
                await self.broadcast(alert_packet)
        
        return generated_alerts

    def clear_hazard_dedup(self, hazard_id: int):
        """When a hazard is cleared, remove it from deduplication cache."""
        keys_to_remove = [k for k in self.dispatched_alerts if k.endswith(f":{hazard_id}")]
        for k in keys_to_remove:
            self.dispatched_alerts.remove(k)

# Global singleton
ws_manager = ConnectionManager()
