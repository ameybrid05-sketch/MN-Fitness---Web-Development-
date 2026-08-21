from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import models, schemas
from app.auth import require_admin

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/users", response_model=List[schemas.UserOut])
def get_all_users(
    role: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    query = db.query(models.User)
    if role:
        query = query.filter(models.User.role == role)
    if search:
        query = query.filter(
            models.User.username.ilike(f"%{search}%") |
            models.User.full_name.ilike(f"%{search}%")
        )
    return query.order_by(models.User.created_at.desc()).all()


@router.get("/users/{user_id}", response_model=schemas.UserOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/users/{user_id}", response_model=schemas.UserOut)
def update_user_role(
    user_id: int,
    data: schemas.AdminUserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if data.role is not None:
        user.role = data.role
    if data.is_active is not None:
        user.is_active = data.is_active
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    db.delete(user)
    db.commit()


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    total_users = db.query(models.User).count()
    active_users = db.query(models.User).filter(models.User.is_active == True).count()
    trainers = db.query(models.User).filter(models.User.role == models.RoleEnum.trainer).count()
    total_workout_logs = db.query(models.WorkoutLog).count()
    total_diet_logs = db.query(models.DietLog).count()
    total_feedback = db.query(models.Feedback).count()
    unresolved_feedback = db.query(models.Feedback).filter(
        models.Feedback.is_resolved == False
    ).count()

    return {
        "total_users": total_users,
        "active_users": active_users,
        "trainers": trainers,
        "total_workout_logs": total_workout_logs,
        "total_diet_logs": total_diet_logs,
        "total_feedback": total_feedback,
        "unresolved_feedback": unresolved_feedback
    }


@router.get("/workout-plans", response_model=List[schemas.WorkoutPlanOut])
def get_all_workout_plans(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    return db.query(models.WorkoutPlan).all()


@router.get("/diet-plans", response_model=List[schemas.DietPlanOut])
def get_all_diet_plans(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_admin)
):
    return db.query(models.DietPlan).all()
