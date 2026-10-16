import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.core.config import settings
from app.models.models import Hazard, Vehicle, Alert, Notification
from app.schemas.schemas import HazardCreate, HazardResponse, HazardStatusUpdate
from app.services.websocket_manager import ws_manager
from app.services.proximity import haversine_distance_meters

router = APIRouter(prefix="/hazards", tags=["Hazards"])

@router.get("", response_model=List[HazardResponse])
def get_hazards(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    hazard_type: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Hazard)
    if status and status != "all":
        query = query.filter(Hazard.status == status)
    if severity and severity != "all":
        query = query.filter(Hazard.severity == severity)
    if hazard_type and hazard_type != "all":
        query = query.filter(Hazard.type == hazard_type)
    if search:
        query = query.filter(
            (Hazard.description.ilike(f"%{search}%")) | 
            (Hazard.type.ilike(f"%{search}%")) |
            (Hazard.reported_by.ilike(f"%{search}%"))
        )
    return query.order_by(Hazard.created_at.desc()).all()

@router.get("/{hazard_id}", response_model=HazardResponse)
def get_hazard(hazard_id: int, db: Session = Depends(get_db)):
    h = db.query(Hazard).filter(Hazard.id == hazard_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hazard not found")
    return h

@router.post("", response_model=HazardResponse)
async def create_hazard(hazard_in: HazardCreate, db: Session = Depends(get_db)):
    h = Hazard(
        type=hazard_in.type,
        severity=hazard_in.severity,
        description=hazard_in.description,
        latitude=hazard_in.latitude,
        longitude=hazard_in.longitude,
        confidence=hazard_in.confidence,
        reported_by=hazard_in.reported_by or "AutoPulse AI Vision",
        image_url=hazard_in.image_url,
        status="detected"
    )
    db.add(h)
    db.commit()
    db.refresh(h)

    # Create notification
    notif = Notification(
        title=f"New Hazard Detected: {h.type.replace('_', ' ').capitalize()}",
        message=f"{h.type.replace('_', ' ').capitalize()} reported at [{h.latitude:.4f}, {h.longitude:.4f}]. Status: Detected.",
        category="hazard",
        severity="warning" if h.severity in ["medium", "high", "critical"] else "info"
    )
    db.add(notif)
    db.commit()

    # Broadcast WebSocket event
    hazard_dict = {
        "id": h.id,
        "type": h.type,
        "severity": h.severity,
        "description": h.description,
        "latitude": h.latitude,
        "longitude": h.longitude,
        "status": h.status,
        "confidence": h.confidence,
        "created_at": h.created_at.isoformat() if h.created_at else None
    }
    await ws_manager.broadcast_hazard_event("HAZARD_DETECTED", hazard_dict)

    return h

@router.patch("/{hazard_id}/status", response_model=HazardResponse)
async def update_hazard_status(hazard_id: int, status_update: HazardStatusUpdate, db: Session = Depends(get_db)):
    h = db.query(Hazard).filter(Hazard.id == hazard_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hazard not found")
    
    new_status = status_update.status.lower()
    valid_statuses = ["detected", "pending_verification", "confirmed", "cleared", "rejected"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Choose from: {valid_statuses}")
    
    h.status = new_status
    if status_update.verified_by:
        h.verified_by = status_update.verified_by
    h.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(h)

    hazard_dict = {
        "id": h.id,
        "type": h.type,
        "severity": h.severity,
        "description": h.description,
        "latitude": h.latitude,
        "longitude": h.longitude,
        "status": h.status,
        "confidence": h.confidence,
        "verified_by": h.verified_by,
        "updated_at": h.updated_at.isoformat() if h.updated_at else None
    }

    # If CONFIRMED -> Trigger real V2V proximity warnings for nearby vehicles!
    if new_status == "confirmed":
        vehicles = db.query(Vehicle).filter(Vehicle.is_connected == True).all()
        vehicle_dicts = [
            {"id": v.id, "name": v.name, "latitude": v.latitude, "longitude": v.longitude} 
            for v in vehicles
        ]
        
        alerts_dispatched = await ws_manager.dispatch_v2v_proximity_alert(
            hazard_dict, 
            vehicle_dicts, 
            radius_meters=settings.DEFAULT_ALERT_RADIUS_METERS
        )

        # Store alert entries in database
        for alert_data in alerts_dispatched:
            alert_row = Alert(
                hazard_id=h.id,
                vehicle_id=alert_data["vehicle_id"],
                message=alert_data["message"],
                severity=h.severity,
                distance_meters=alert_data["distance_meters"]
            )
            db.add(alert_row)
        
        # Add high priority notification
        notif = Notification(
            title=f"Hazard CONFIRMED: {h.type.replace('_', ' ').capitalize()}",
            message=f"Hazard #{h.id} confirmed. V2V alert broadcast to {len(alerts_dispatched)} connected vehicle(s) within {int(settings.DEFAULT_ALERT_RADIUS_METERS)}m.",
            category="hazard",
            severity="danger" if h.severity in ["high", "critical"] else "warning"
        )
        db.add(notif)
        db.commit()

        await ws_manager.broadcast_hazard_event("HAZARD_CONFIRMED", hazard_dict)

    elif new_status == "cleared":
        ws_manager.clear_hazard_dedup(h.id)
        notif = Notification(
            title=f"Hazard CLEARED: {h.type.replace('_', ' ').capitalize()}",
            message=f"Road hazard #{h.id} has been resolved and marked cleared. V2V warnings deactivated.",
            category="hazard",
            severity="success"
        )
        db.add(notif)
        db.commit()
        await ws_manager.broadcast_hazard_event("HAZARD_CLEARED", hazard_dict)

    elif new_status == "pending_verification":
        await ws_manager.broadcast_hazard_event("HAZARD_PENDING_VERIFICATION", hazard_dict)

    elif new_status == "rejected":
        ws_manager.clear_hazard_dedup(h.id)
        await ws_manager.broadcast_hazard_event("HAZARD_REJECTED", hazard_dict)

    return h

@router.delete("/{hazard_id}")
async def delete_hazard(hazard_id: int, db: Session = Depends(get_db)):
    h = db.query(Hazard).filter(Hazard.id == hazard_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="Hazard not found")
    db.delete(h)
    db.commit()
    ws_manager.clear_hazard_dedup(hazard_id)
    await ws_manager.broadcast({"type": "HAZARD_DELETED", "hazard_id": hazard_id})
    return {"status": "success", "message": f"Hazard #{hazard_id} deleted"}
