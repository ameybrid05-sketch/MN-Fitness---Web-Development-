@echo off
title MN Fitness - Installation
color 0B

echo.
echo  ╔══════════════════════════════════════╗
echo  ║     MN FITNESS - Installation        ║
echo  ╚══════════════════════════════════════╝
echo.

cd /d "%~dp0backend"

echo [STEP 1] Creating Python virtual environment...
python -m venv venv
if errorlevel 1 (
    echo [ERROR] Python 3.10+ is required. Download from https://python.org
    pause
    exit /b 1
)

echo [STEP 2] Activating virtual environment...
call venv\Scripts\activate.bat

echo [STEP 3] Installing Python packages...
pip install --upgrade pip --quiet
pip install -r requirements.txt
if errorlevel 1 (
    echo [ERROR] Failed to install packages.
    pause
    exit /b 1
)

echo.
echo  ╔══════════════════════════════════════════════════════════╗
echo  ║  IMPORTANT: Before starting, configure your database!   ║
echo  ║                                                          ║
echo  ║  1. Open MySQL and run: setup_database.sql              ║
echo  ║  2. Edit backend\.env and set your MySQL password       ║
echo  ║  3. Run start.bat to launch the application             ║
echo  ╚══════════════════════════════════════════════════════════╝
echo.
echo Installation complete!
pause
