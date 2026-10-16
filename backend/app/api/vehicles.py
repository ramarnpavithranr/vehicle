import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.models import Vehicle, VehicleHealth, Hazard, Alert
from app.schemas.schemas import VehicleCreate, VehicleResponse, VehicleLocationUpdate
from app.services.websocket_manager import ws_manager
from app.services.proximity import haversine_distance_meters
from app.core.config import settings

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

@router.get("", response_model=List[VehicleResponse])
def get_vehicles(db: Session = Depends(get_db)):
    return db.query(Vehicle).all()

@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return v

@router.post("", response_model=VehicleResponse)
def create_vehicle(vehicle_in: VehicleCreate, db: Session = Depends(get_db)):
    v = Vehicle(
        name=vehicle_in.name,
        model=vehicle_in.model,
        plate_number=vehicle_in.plate_number,
        latitude=vehicle_in.latitude,
        longitude=vehicle_in.longitude,
        speed=vehicle_in.speed,
        heading=vehicle_in.heading,
        status="active",
        is_connected=True
    )
    db.add(v)
    db.commit()
    db.refresh(v)

    # Add default health entry
    health = VehicleHealth(vehicle_id=v.id)
    db.add(health)
    db.commit()

    return v

@router.patch("/{vehicle_id}/location", response_model=VehicleResponse)
async def update_vehicle_location(
    vehicle_id: int, 
    loc: VehicleLocationUpdate, 
    db: Session = Depends(get_db)
):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    v.latitude = loc.latitude
    v.longitude = loc.longitude
    if loc.speed is not None:
        v.speed = loc.speed
    if loc.heading is not None:
        v.heading = loc.heading
    v.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(v)

    # Check proximity to confirmed hazards
    confirmed_hazards = db.query(Hazard).filter(Hazard.status == "confirmed").all()
    triggered_alerts = []
    for h in confirmed_hazards:
        dist = haversine_distance_meters(v.latitude, v.longitude, h.latitude, h.longitude)
        if dist <= settings.DEFAULT_ALERT_RADIUS_METERS:
            dedup_key = f"{v.id}:{h.id}"
            if dedup_key not in ws_manager.dispatched_alerts:
                ws_manager.dispatched_alerts.add(dedup_key)
                alert_packet = {
                    "type": "V2V_ALERT",
                    "hazard_id": h.id,
                    "hazard_type": h.type,
                    "severity": h.severity,
                    "distance_meters": dist,
                    "vehicle_id": v.id,
                    "vehicle_name": v.name,
                    "coordinates": {"lat": h.latitude, "lng": h.longitude},
                    "message": f"DANGER: {h.type.replace('_', ' ').upper()} detected {int(dist)}m ahead! Reduce speed.",
                    "voice_message": f"Caution. {h.type.replace('_', ' ')} ahead.",
                    "timestamp": datetime.datetime.utcnow().isoformat()
                }
                triggered_alerts.append(alert_packet)
                await ws_manager.broadcast(alert_packet)

    # Broadcast vehicle movement
    await ws_manager.broadcast({
        "type": "VEHICLE_MOVED",
        "vehicle_id": v.id,
        "name": v.name,
        "latitude": v.latitude,
        "longitude": v.longitude,
        "speed": v.speed,
        "heading": v.heading
    })

    return v
