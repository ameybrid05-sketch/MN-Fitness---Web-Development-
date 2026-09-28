from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user, require_admin

router = APIRouter(prefix="/api/feedback", tags=["Feedback"])


@router.post("/", response_model=schemas.FeedbackOut, status_code=201)
def submit_feedback(
    data: schemas.FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    fb = models.Feedback(
        user_id=current_user.id,
        subject=data.subject,
        message=data.message,
        rating=data.rating
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb


@router.get("/my", response_model=List[schemas.FeedbackOut])
def get_my_feedback(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return (
        db.query(models.Feedback)
        .filter(models.Feedback.user_id == current_user.id)
        .order_by(models.Feedback.created_at.desc())
        .all()
    )


@router.get("/all", response_model=List[schemas.FeedbackOut])
def get_all_feedback(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    return (
        db.query(models.Feedback)
        .order_by(models.Feedback.created_at.desc())
        .all()
    )


@router.put("/{fb_id}/resolve", response_model=schemas.FeedbackOut)
def resolve_feedback(
    fb_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    fb = db.query(models.Feedback).filter(models.Feedback.id == fb_id).first()
    if not fb:
        raise HTTPException(status_code=404, detail="Feedback not found")
    fb.is_resolved = True
    db.commit()
    db.refresh(fb)
    return fb
