@echo off
title Urban Eco OS - Startup Orchestrator
echo ==========================================================
echo         Urban Eco OS Environmental Intelligence Platform
echo ==========================================================
echo.

echo Starting Node.js Backend Server on Port 5000...
start "Urban Eco - Backend Server" cmd /k "cd backend && npm start"

echo Starting FastAPI AI Engine on Port 8000...
start "Urban Eco - Python AI Engine" cmd /k "cd ai-service && venv\Scripts\activate && uvicorn main:app --reload --port 8000"

echo Starting Vite React Frontend on Port 5173...
start "Urban Eco - React Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ==========================================================
echo   Urban Eco OS is booting!
echo   - Frontend: http://localhost:5173
echo   - Backend:  http://localhost:5000
echo   - AI Engine: http://localhost:8000
echo ==========================================================
echo.
echo   Login credentials (password: password123):
echo   - admin      (Full system control)
echo   - engineer   (Simulations and what-if scenarios)
echo   - safety     (Document indexing)
echo   - technician (Maintenance actions)
echo.
echo ==========================================================
echo Press any key to close this launcher. The servers will keep running.
pause > nul
