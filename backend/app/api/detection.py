import base64
import time
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.services.yolo_detector import detector
from app.models.models import Hazard, Notification
from app.schemas.schemas import DetectionFrameResponse, HazardResponse
from app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/detection", tags=["AI Road Hazard Detection"])

@router.post("/analyze-frame", response_model=DetectionFrameResponse)
async def analyze_frame(
    file: UploadFile = File(...),
    confidence_threshold: float = Form(0.50)
):
    try:
        contents = await file.read()
        result = detector.analyze_image_bytes(contents, confidence_threshold=confidence_threshold)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Frame analysis failed: {e}")

@router.get("/demo-frame", response_model=DetectionFrameResponse)
def get_demo_frame(confidence_threshold: float = 0.5):
    """
    Returns realistic simulated road detections for instant evaluation
    even without physical camera or external video file.
    """
    result = detector.analyze_image_bytes(b"", confidence_threshold=confidence_threshold)
    return result

@router.post("/report-from-detection", response_model=HazardResponse)
async def report_from_detection(
    hazard_type: str = Form(...),
    severity: str = Form("medium"),
    latitude: float = Form(...),
    longitude: float = Form(...),
    confidence: float = Form(0.88),
    description: str = Form(None),
    db: Session = Depends(get_db)
):
    """Allows one-click reporting of an AI detected hazard directly into the system."""
    h = Hazard(
        type=hazard_type,
        severity=severity,
        description=description or f"AI Vision detected {hazard_type} with {confidence*100:.1f}% confidence.",
        latitude=latitude,
        longitude=longitude,
        confidence=confidence,
        reported_by="AutoPulse AI Camera",
        status="detected"
    )
    db.add(h)
    db.commit()
    db.refresh(h)

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

    notif = Notification(
        title=f"AI Vision Reported: {h.type.replace('_', ' ').capitalize()}",
        message=f"Vision stream detected {h.type} at [{h.latitude:.4f}, {h.longitude:.4f}]. Pending verification.",
        category="hazard",
        severity="warning"
    )
    db.add(notif)
    db.commit()

    return h
