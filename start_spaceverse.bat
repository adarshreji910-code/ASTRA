@echo off
echo ======================================================================
echo                  STARTING SPACEVERSE PLATFORM
echo ======================================================================
echo.

set "PATH=C:\Users\ASUS\AppData\Local\Programs\nodejs;%PATH%"

echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "SPACEVERSE Backend" cmd /k "python backend\run.py"

timeout /t 2 /nobreak >nul

echo Starting Vite Frontend on http://127.0.0.1:5173 ...
start "SPACEVERSE Frontend" cmd /k "cd frontend && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo ======================================================================
echo   SPACEVERSE is running!
echo   Frontend : http://127.0.0.1:5173
echo   Backend  : http://127.0.0.1:8000/docs
echo ======================================================================
echo.
pause
