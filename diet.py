from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter(prefix="/api/diet", tags=["Diet"])


@router.get("/plans", response_model=List[schemas.DietPlanOut])
def get_diet_plans(
    goal: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.DietPlan)
    if goal:
        query = query.filter(models.DietPlan.goal == goal)
    return query.all()


@router.get("/plans/my-goal", response_model=List[schemas.DietPlanOut])
def get_diet_plans_for_my_goal(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.goal:
        raise HTTPException(status_code=400, detail="Please set your fitness goal first")
    return (
        db.query(models.DietPlan)
        .filter(models.DietPlan.goal == current_user.goal)
        .all()
    )


@router.get("/plans/{plan_id}", response_model=schemas.DietPlanOut)
def get_diet_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    plan = db.query(models.DietPlan).filter(models.DietPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan


@router.post("/logs", response_model=schemas.DietLogOut, status_code=201)
def log_diet(
    data: schemas.DietLogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    log = models.DietLog(
        user_id=current_user.id,
        plan_id=data.plan_id,
        meal_name=data.meal_name,
        food_items=data.food_items,
        calories=data.calories,
        protein_g=data.protein_g,
        carbs_g=data.carbs_g,
        fat_g=data.fat_g,
        notes=data.notes
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/logs", response_model=List[schemas.DietLogOut])
def get_diet_logs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return (
        db.query(models.DietLog)
        .filter(models.DietLog.user_id == current_user.id)
        .order_by(models.DietLog.logged_at.desc())
        .all()
    )


@router.delete("/logs/{log_id}", status_code=204)
def delete_diet_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    log = db.query(models.DietLog).filter(
        models.DietLog.id == log_id,
        models.DietLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    db.delete(log)
    db.commit()
