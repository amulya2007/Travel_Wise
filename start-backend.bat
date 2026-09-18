@echo off
echo Starting TravelWise FastAPI Backend...
cd backend
if exist venv\Scripts\python.exe (
    venv\Scripts\python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
) else (
    python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
)
pause
