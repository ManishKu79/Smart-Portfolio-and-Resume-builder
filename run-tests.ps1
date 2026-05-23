# run-tests.ps1 - Fixed version without special characters
Write-Host "Starting Test Suite" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Backend tests
Write-Host "`n[1] Running Backend Tests..." -ForegroundColor Yellow
Set-Location E:\Alpha\backend

if (Test-Path "node_modules") {
    Write-Host "Running unit tests..."
    npm run test:unit
    
    Write-Host "Running integration tests..."
    npm run test:integration
} else {
    Write-Host "Backend dependencies not installed. Run 'npm install' first." -ForegroundColor Red
}

# Frontend tests
Write-Host "`n[2] Running Frontend Tests..." -ForegroundColor Yellow
Set-Location E:\Alpha\frontend

if (Test-Path "node_modules") {
    Write-Host "Running component tests..."
    npm run test
} else {
    Write-Host "Frontend dependencies not installed. Run 'npm install' first." -ForegroundColor Red
}

Write-Host "`nTest suite execution completed!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan