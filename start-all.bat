@echo off
echo ========================================================
echo   Launching TravelWise Smart Travel Planning Platform
echo ========================================================
echo.
echo Starting FastAPI Backend in new window...
start "TravelWise Backend (Port 8000)" cmd /k "cd backend && .venv\Scripts\python -m uvicorn app.main:app --reload --port 8000"

echo Starting Vite React Frontend in new window...
start "TravelWise Frontend (Port 5173)" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are launching!
echo Backend API Docs: http://localhost:8000/docs
echo Frontend Web App: http://localhost:5173
echo.
pause
