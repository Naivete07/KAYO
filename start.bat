@echo off
echo ===================================================
echo   KAYO: AI-Driven Scam Pattern Recognition Engine
echo   CodeSlayer 2k26 - DevSphereIndia
echo   Team: Tasteless Balls
echo ===================================================
echo.
echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "KAYO Backend API" cmd /k "cd /d "%~dp0backend" && python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting Vite React Frontend on http://localhost:5173 ...
start "KAYO Frontend UI" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Both servers are starting! Open http://localhost:5173 in your browser.
