import json
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.seed_data import seed_database
from app.services.websocket_manager import ws_manager
from app.api import auth, hazards, vehicles, health, documents, notifications, detection, simulation

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("AutoPulse.Server")

# Initialize FastAPI app
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Vehicle Communication and Road Hazard Awareness System API"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for development & proxy
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auto-seed database on startup
@app.on_event("startup")
def on_startup():
    logger.info("Initializing database schema and seed data...")
    Base.metadata.create_all(bind=engine)
    seed_database()
    logger.info("AutoPulse AI backend ready.")

# Register API routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(hazards.router, prefix=settings.API_PREFIX)
app.include_router(vehicles.router, prefix=settings.API_PREFIX)
app.include_router(health.router, prefix=settings.API_PREFIX)
app.include_router(documents.router, prefix=settings.API_PREFIX)
app.include_router(notifications.router, prefix=settings.API_PREFIX)
app.include_router(detection.router, prefix=settings.API_PREFIX)
app.include_router(simulation.router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "status": "Online",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "api_prefix": settings.API_PREFIX
    }

@app.get("/api/system-status")
def system_status():
    return {
        "status": "operational",
        "v2v_websocket_clients": len(ws_manager.active_connections),
        "ai_vision_status": "active",
        "default_alert_radius_meters": settings.DEFAULT_ALERT_RADIUS_METERS
    }

# Real-time WebSocket endpoint for V2V communication
@app.websocket("/ws/v2v")
async def websocket_v2v_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket, client_type="dashboard_or_vehicle")
    try:
        # Send initial welcome packet
        await websocket.send_text(json.dumps({
            "type": "CONNECTION_ESTABLISHED",
            "message": "Connected to AutoPulse V2V Real-Time Communication Hub",
            "active_clients": len(ws_manager.active_connections)
        }))

        while True:
            data_text = await websocket.receive_text()
            try:
                data = json.loads(data_text)
                msg_type = data.get("type")

                # Handle ping/heartbeat
                if msg_type == "PING":
                    await websocket.send_text(json.dumps({"type": "PONG", "timestamp": data.get("timestamp")}))
                
                # Handle client simulated telemetry or position update
                elif msg_type == "TELEMETRY_UPDATE":
                    await ws_manager.broadcast({
                        "type": "VEHICLE_MOVED",
                        "vehicle_id": data.get("vehicle_id"),
                        "latitude": data.get("latitude"),
                        "longitude": data.get("longitude"),
                        "speed": data.get("speed"),
                        "heading": data.get("heading")
                    })

                # Handle client-initiated custom alert
                elif msg_type == "BROADCAST_ALERT":
                    await ws_manager.broadcast(data)

            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket session error: {e}")
        ws_manager.disconnect(websocket)
