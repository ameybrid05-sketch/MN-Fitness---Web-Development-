from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from app.config import settings
from app.database import create_tables, SessionLocal
from app.routers import auth, progress, workout, diet, trainer, articles, feedback, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting MN Fitness API...")
    create_tables()
    db = SessionLocal()
    try:
        from app.seed_data import seed_database
        seed_database(db)
    finally:
        db.close()
    print("✅ MN Fitness API is ready!")
    yield
    # Shutdown (nothing needed)


app = FastAPI(
    title=settings.APP_NAME,
    description="MN Fitness - Health & Fitness Platform API",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(progress.router)
app.include_router(workout.router)
app.include_router(diet.router)
app.include_router(trainer.router)
app.include_router(articles.router)
app.include_router(feedback.router)
app.include_router(admin.router)

# Serve frontend static files
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
if os.path.exists(frontend_path):
    assets_path = os.path.join(frontend_path, "assets")
    if os.path.exists(assets_path):
        app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

    @app.get("/", include_in_schema=False)
    def serve_home():
        return FileResponse(os.path.join(frontend_path, "index.html"))

    @app.get("/{path:path}", include_in_schema=False)
    def serve_frontend(path: str):
        file_path = os.path.join(frontend_path, path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_path, "index.html"))


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "app": settings.APP_NAME}
