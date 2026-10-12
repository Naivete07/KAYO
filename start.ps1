Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  KAYO: AI-Driven Scam Pattern Recognition Engine" -ForegroundColor Green
Write-Host "  CodeSlayer 2k26 - DevSphereIndia" -ForegroundColor Yellow
Write-Host "  Team: Tasteless Balls" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

$Root = $PSScriptRoot
if (-not $Root) { $Root = (Get-Item .).FullName }

Write-Host "Starting FastAPI Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$Root\backend'; python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "Starting React Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$Root\frontend'; npm run dev"

Write-Host ""
Write-Host "KAYO Platform is launched!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Backend Docs: http://127.0.0.1:8000/docs" -ForegroundColor White
