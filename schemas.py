from pydantic import BaseModel, field_validator
from typing import Optional, List, Any
from datetime import datetime
from app.models import RoleEnum, GenderEnum, GoalEnum


# ─── Auth Schemas ────────────────────────────────────────────────────────────

class UserRegister(BaseModel):
    username: str
    password: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[GenderEnum] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    goal: Optional[GoalEnum] = None

    @field_validator("username")
    @classmethod
    def username_alphanumeric(cls, v):
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        return v

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v):
        if len(v) < 6:
            raise ValueError("Password must be at least 6 characters")
        return v


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserOut"


class UserOut(BaseModel):
    id: int
    username: str
    full_name: Optional[str]
    email: Optional[str]
    age: Optional[int]
    gender: Optional[GenderEnum]
    height: Optional[float]
    weight: Optional[float]
    goal: Optional[GoalEnum]
    role: RoleEnum
    is_active: bool
    created_at: Optional[datetime]

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[GenderEnum] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    goal: Optional[GoalEnum] = None


# ─── Progress Schemas ────────────────────────────────────────────────────────

class ProgressLogCreate(BaseModel):
    weight: Optional[float] = None
    bmi: Optional[float] = None
    body_fat: Optional[float] = None
    notes: Optional[str] = None


class ProgressLogOut(BaseModel):
    id: int
    user_id: int
    weight: Optional[float]
    bmi: Optional[float]
    body_fat: Optional[float]
    notes: Optional[str]
    logged_at: datetime

    class Config:
        from_attributes = True


# ─── Workout Schemas ─────────────────────────────────────────────────────────

class WorkoutPlanOut(BaseModel):
    id: int
    name: str
    goal: GoalEnum
    level: str
    description: Optional[str]
    duration_weeks: int
    exercises: Optional[Any]
    created_at: datetime

    class Config:
        from_attributes = True


class WorkoutLogCreate(BaseModel):
    plan_id: Optional[int] = None
    exercise_name: str
    sets: Optional[int] = None
    reps: Optional[int] = None
    weight_used: Optional[float] = None
    duration_minutes: Optional[int] = None
    calories_burned: Optional[float] = None
    notes: Optional[str] = None


class WorkoutLogOut(BaseModel):
    id: int
    user_id: int
    plan_id: Optional[int]
    exercise_name: str
    sets: Optional[int]
    reps: Optional[int]
    weight_used: Optional[float]
    duration_minutes: Optional[int]
    calories_burned: Optional[float]
    notes: Optional[str]
    logged_at: datetime

    class Config:
        from_attributes = True


# ─── Diet Schemas ─────────────────────────────────────────────────────────────

class DietPlanOut(BaseModel):
    id: int
    name: str
    goal: GoalEnum
    calories_per_day: Optional[int]
    protein_g: Optional[float]
    carbs_g: Optional[float]
    fat_g: Optional[float]
    meals: Optional[Any]
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class DietLogCreate(BaseModel):
    plan_id: Optional[int] = None
    meal_name: str
    food_items: Optional[Any] = None
    calories: Optional[float] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    notes: Optional[str] = None


class DietLogOut(BaseModel):
    id: int
    user_id: int
    plan_id: Optional[int]
    meal_name: str
    food_items: Optional[Any]
    calories: Optional[float]
    protein_g: Optional[float]
    carbs_g: Optional[float]
    fat_g: Optional[float]
    notes: Optional[str]
    logged_at: datetime

    class Config:
        from_attributes = True


# ─── Trainer Plan Schemas ─────────────────────────────────────────────────────

class TrainerPlanCreate(BaseModel):
    user_id: int
    plan_type: str
    goal: GoalEnum
    title: str
    content: Optional[Any] = None
    notes: Optional[str] = None


class TrainerPlanOut(BaseModel):
    id: int
    trainer_id: int
    user_id: int
    plan_type: str
    goal: GoalEnum
    title: str
    content: Optional[Any]
    notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Article Schemas ──────────────────────────────────────────────────────────

class ArticleCreate(BaseModel):
    title: str
    content: str
    category: Optional[str] = None
    image_url: Optional[str] = None


class ArticleOut(BaseModel):
    id: int
    title: str
    content: str
    category: Optional[str]
    author_id: Optional[int]
    image_url: Optional[str]
    is_published: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Feedback Schemas ─────────────────────────────────────────────────────────

class FeedbackCreate(BaseModel):
    subject: str
    message: str
    rating: Optional[int] = None


class FeedbackOut(BaseModel):
    id: int
    user_id: int
    subject: str
    message: str
    rating: Optional[int]
    is_resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Admin Schemas ────────────────────────────────────────────────────────────

class AdminUserUpdate(BaseModel):
    role: Optional[RoleEnum] = None
    is_active: Optional[bool] = None


Token.model_rebuild()
