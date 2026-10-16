from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import Notification
from app.schemas.schemas import NotificationResponse

router = APIRouter(prefix="/notifications", tags=["Notifications & History"])

@router.get("", response_model=List[NotificationResponse])
def get_notifications(
    category: Optional[str] = None, 
    unread_only: bool = False, 
    db: Session = Depends(get_db)
):
    query = db.query(Notification)
    if category and category != "all":
        query = query.filter(Notification.category == category)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    return query.order_by(Notification.timestamp.desc()).all()

@router.patch("/{notif_id}/read", response_model=NotificationResponse)
def mark_read(notif_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif

@router.post("/mark-all-read")
def mark_all_read(db: Session = Depends(get_db)):
    db.query(Notification).filter(Notification.is_read == False).update({"is_read": True})
    db.commit()
    return {"status": "success", "message": "All notifications marked as read"}

@router.delete("/{notif_id}")
def delete_notification(notif_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notif_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    db.delete(notif)
    db.commit()
    return {"status": "success", "message": f"Notification #{notif_id} deleted"}
