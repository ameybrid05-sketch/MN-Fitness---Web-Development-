@echo off
title MN Fitness - Server Running
color 0A
cls

echo.
echo  ============================================
echo       MN FITNESS - Server is Starting
echo  ============================================
echo.
echo   Website:   http://localhost:8000
echo   API Docs:  http://localhost:8000/api/docs
echo.
echo   Admin Login:    admin / admin123
echo   Trainer Login:  trainer1 / trainer123
echo.
echo   Press Ctrl+C to stop the server
echo  ============================================
echo.

cd /d "d:\Project\backend"
start "" "http://localhost:8000"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause
