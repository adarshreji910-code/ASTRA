# SPACEVERSE PowerShell Launcher
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "                  STARTING SPACEVERSE PLATFORM" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan

$env:Path = "C:\Users\ASUS\AppData\Local\Programs\nodejs;$env:Path"

Write-Host "Starting FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python backend\run.py"

Start-Sleep -Seconds 2

Write-Host "Starting Vite Frontend on http://127.0.0.1:5173 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev -- --host 127.0.0.1 --port 5173"

Write-Host "`nSPACEVERSE is up and running!" -ForegroundColor Cyan
Write-Host "Frontend : http://127.0.0.1:5173" -ForegroundColor Yellow
Write-Host "Backend  : http://127.0.0.1:8000/docs`n" -ForegroundColor Yellow
