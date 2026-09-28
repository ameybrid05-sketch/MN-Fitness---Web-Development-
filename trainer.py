from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user, require_trainer

router = APIRouter(prefix="/api/trainer", tags=["Trainer"])


@router.post("/plans", response_model=schemas.TrainerPlanOut, status_code=201)
def create_trainer_plan(
    data: schemas.TrainerPlanCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_trainer)
):
    # Verify target user exists
    target_user = db.query(models.User).filter(models.User.id == data.user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")

    plan = models.TrainerPlan(
        trainer_id=current_user.id,
        user_id=data.user_id,
        plan_type=data.plan_type,
        goal=data.goal,
        title=data.title,
        content=data.content,
        notes=data.notes
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


@router.get("/plans/my-clients", response_model=List[schemas.TrainerPlanOut])
def get_my_client_plans(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_trainer)
):
    return (
        db.query(models.TrainerPlan)
        .filter(models.TrainerPlan.trainer_id == current_user.id)
        .order_by(models.TrainerPlan.created_at.desc())
        .all()
    )


@router.get("/plans/for-me", response_model=List[schemas.TrainerPlanOut])
def get_plans_for_me(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return (
        db.query(models.TrainerPlan)
        .filter(models.TrainerPlan.user_id == current_user.id)
        .order_by(models.TrainerPlan.created_at.desc())
        .all()
    )


@router.get("/users", response_model=List[schemas.UserOut])
def get_all_users_for_trainer(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_trainer)
):
    return (
        db.query(models.User)
        .filter(models.User.role == models.RoleEnum.user)
        .all()
    )
