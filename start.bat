@echo off
title MN Fitness - Server
color 0A

echo.
echo  ╔══════════════════════════════════════╗
echo  ║       MN FITNESS - Starting...       ║
echo  ╚══════════════════════════════════════╝
echo.

cd /d "%~dp0backend"

:: Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo [INFO] Creating virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo [ERROR] Python not found. Please install Python 3.10+
        pause
        exit /b 1
    )
)

:: Activate venv
call venv\Scripts\activate.bat

:: Install dependencies
echo [INFO] Installing dependencies...
pip install -r requirements.txt --quiet

echo.
echo [INFO] Starting MN Fitness API server...
echo [INFO] API:       http://localhost:8000
echo [INFO] API Docs:  http://localhost:8000/api/docs
echo [INFO] Frontend:  http://localhost:8000
echo.
echo [INFO] Default login: admin / admin123
echo [INFO] Trainer login: trainer1 / trainer123
echo.
echo Press Ctrl+C to stop the server
echo.

python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause
