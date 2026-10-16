import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.models import DocumentReminder, Notification
from app.schemas.schemas import (
    DocumentReminderCreate, 
    DocumentReminderUpdate, 
    DocumentReminderResponse
)

router = APIRouter(prefix="/documents", tags=["Documents & Reminders"])

@router.get("", response_model=List[DocumentReminderResponse])
def get_documents(
    category: Optional[str] = None, 
    status: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    query = db.query(DocumentReminder)
    if category and category != "all":
        query = query.filter(DocumentReminder.category == category)
    if status and status != "all":
        query = query.filter(DocumentReminder.status == status)
    return query.order_by(DocumentReminder.expiry_date.asc()).all()

@router.post("", response_model=DocumentReminderResponse)
def create_document(doc_in: DocumentReminderCreate, db: Session = Depends(get_db)):
    doc = DocumentReminder(
        title=doc_in.title,
        category=doc_in.category,
        document_number=doc_in.document_number,
        expiry_date=doc_in.expiry_date,
        status=doc_in.status or "upcoming",
        notes=doc_in.notes
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # If due soon or overdue, create notification
    if doc.status in ["due_soon", "overdue"]:
        notif = Notification(
            title=f"Document Alert: {doc.title}",
            message=f"Document '{doc.title}' ({doc.category.upper()}) is {doc.status.replace('_', ' ')}! Expiry: {doc.expiry_date}.",
            category="document",
            severity="warning" if doc.status == "due_soon" else "danger"
        )
        db.add(notif)
        db.commit()

    return doc

@router.patch("/{doc_id}", response_model=DocumentReminderResponse)
def update_document(
    doc_id: int, 
    doc_in: DocumentReminderUpdate, 
    db: Session = Depends(get_db)
):
    doc = db.query(DocumentReminder).filter(DocumentReminder.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document reminder not found")
    
    if doc_in.title is not None:
        doc.title = doc_in.title
    if doc_in.category is not None:
        doc.category = doc_in.category
    if doc_in.document_number is not None:
        doc.document_number = doc_in.document_number
    if doc_in.expiry_date is not None:
        doc.expiry_date = doc_in.expiry_date
    if doc_in.status is not None:
        doc.status = doc_in.status
    if doc_in.notes is not None:
        doc.notes = doc_in.notes

    db.commit()
    db.refresh(doc)
    return doc

@router.delete("/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    doc = db.query(DocumentReminder).filter(DocumentReminder.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document reminder not found")
    db.delete(doc)
    db.commit()
    return {"status": "success", "message": f"Document #{doc_id} deleted"}

@router.get("/sample-fines")
def get_sample_fines():
    """
    Returns sample illustrative traffic fine information.
    Clearly labeled as simulated / illustrative to satisfy compliance requirements.
    """
    return {
        "disclaimer": "Sample illustrative records for demonstration only. This application does not query official government traffic challan or RTO databases.",
        "records": [
            {
                "id": "ILLUST-CH-8921",
                "violation": "Exceeding speed limit in roadwork zone (Simulated)",
                "date": "2026-03-24",
                "amount": 1000,
                "currency": "INR",
                "status": "Paid",
                "location": "Sector 4 Bypass, Highway 44"
            },
            {
                "id": "ILLUST-CH-9104",
                "violation": "Improper lane change near hazard zone (Simulated)",
                "date": "2026-04-02",
                "amount": 500,
                "currency": "INR",
                "status": "Under Review",
                "location": "North Ring Road, Junction 12"
            }
        ]
    }
