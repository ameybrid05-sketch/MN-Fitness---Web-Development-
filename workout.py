from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user, require_trainer

router = APIRouter(prefix="/api/workouts", tags=["Workouts"])


@router.get("/plans", response_model=List[schemas.WorkoutPlanOut])
def get_workout_plans(
    goal: Optional[str] = Query(None),
    level: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.WorkoutPlan)
    if goal:
        query = query.filter(models.WorkoutPlan.goal == goal)
    if level:
        query = query.filter(models.WorkoutPlan.level == level)
    return query.all()


@router.get("/plans/my-goal", response_model=List[schemas.WorkoutPlanOut])
def get_plans_for_my_goal(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not current_user.goal:
        raise HTTPException(status_code=400, detail="Please set your fitness goal first")
    return (
        db.query(models.WorkoutPlan)
        .filter(models.WorkoutPlan.goal == current_user.goal)
        .all()
    )


@router.get("/plans/{plan_id}", response_model=schemas.WorkoutPlanOut)
def get_workout_plan(
    plan_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    plan = db.query(models.WorkoutPlan).filter(models.WorkoutPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan


@router.post("/logs", response_model=schemas.WorkoutLogOut, status_code=201)
def log_workout(
    data: schemas.WorkoutLogCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    log = models.WorkoutLog(
        user_id=current_user.id,
        plan_id=data.plan_id,
        exercise_name=data.exercise_name,
        sets=data.sets,
        reps=data.reps,
        weight_used=data.weight_used,
        duration_minutes=data.duration_minutes,
        calories_burned=data.calories_burned,
        notes=data.notes
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.get("/logs", response_model=List[schemas.WorkoutLogOut])
def get_workout_logs(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    return (
        db.query(models.WorkoutLog)
        .filter(models.WorkoutLog.user_id == current_user.id)
        .order_by(models.WorkoutLog.logged_at.desc())
        .all()
    )


@router.delete("/logs/{log_id}", status_code=204)
def delete_workout_log(
    log_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    log = db.query(models.WorkoutLog).filter(
        models.WorkoutLog.id == log_id,
        models.WorkoutLog.user_id == current_user.id
    ).first()
    if not log:
        raise HTTPException(status_code=404, detail="Log not found")
    db.delete(log)
    db.commit()
