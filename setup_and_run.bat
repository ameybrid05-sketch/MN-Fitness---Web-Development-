@echo off
title MN Fitness - Setup & Run
color 0A
cls

echo.
echo  ============================================
echo       MN FITNESS - Setup and Run
echo  ============================================
echo.
echo  Python   : Already Installed (3.13)
echo  MySQL    : Already Installed (8.0.46)
echo  Packages : Already Installed
echo.
echo  NOTE: If your MySQL password contains @ symbol,
echo        it is automatically handled.
echo  ============================================
echo.

:: ── STEP 1: Create database using Python (handles special chars) ─
echo [1/3] Creating database mn_fitness...
python -c "
import pymysql, sys
try:
    conn = pymysql.connect(host='localhost', user='root', password='swamisamarth@0905')
    conn.cursor().execute('CREATE DATABASE IF NOT EXISTS mn_fitness CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci')
    conn.commit()
    conn.close()
    print('  Database ready!')
except Exception as e:
    print('  ERROR:', e)
    sys.exit(1)
"
if errorlevel 1 (
    echo.
    echo  [ERROR] Could not connect to MySQL.
    echo  Please open setup_and_run.bat and update the password on line above.
    pause
    exit /b 1
)

:: ── STEP 2: Start the server ─────────────────────────────────────
echo.
echo [2/3] Starting MN Fitness server...
echo.
echo  ============================================
echo   App is running at:
echo   http://localhost:8000
echo.
echo   API Docs:  http://localhost:8000/api/docs
echo.
echo   Login:     admin / admin123
echo   Trainer:   trainer1 / trainer123
echo  ============================================
echo.
echo  Opening browser...
echo  Press Ctrl+C to stop the server.
echo.

timeout /t 2 /nobreak >nul
start "" "http://localhost:8000"

cd /d "d:\Project\backend"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause
