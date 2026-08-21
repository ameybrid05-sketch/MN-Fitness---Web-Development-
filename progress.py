from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter(prefix="/api/progress", tags=["Progress"])


@router.post("/", response_model=schemas.ProgressLogOut, status_code=201)
def log_progress(
    data: schemas.ProgressLogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Auto-calculate BMI if height and weight provided
    bmi = data.bmi
    if not bmi and current_user.height and data.weight:
        height_m = current_user.height / 100
        bmi = round(data.weight / (height_m ** 2), 2)

    log = models.ProgressLog(
        user_id=current_user.id,
        weight=data.weight,
        bmi=bmi,
        body_fat=data.body_fat,
        notes=data.notes
    )
    db.add(log)
    # Update user's current weight
    if data.weight:
        current_user.weight = data.weight
    db.commit()
    db.refresh(log)
    return log


@router.get("/", response_model=List[schemas.ProgressLogOut])
def get_progress(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return (
        db.query(models.ProgressLog)
        .filter(models.ProgressLog.user_id == current_user.id)
        .order_by(models.ProgressLog.logged_at.desc())
        .all()
    )


@router.delete("/{log_id}", status_code=204)
def delete_progress(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    log = db.query(models.ProgressLog).filter(
        models.ProgressLog.id == log_id,
        models.ProgressLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    db.delete(log)
    db.commit()
