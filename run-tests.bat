@echo off
echo ========================================
echo Starting Test Suite
echo ========================================

echo.
echo [1/3] Running Backend Unit Tests...
cd backend
if exist node_modules (
    call npm run test:unit
    if errorlevel 1 goto :error
) else (
    echo Backend dependencies not installed. Run 'npm install' first.
    goto :error
)

echo.
echo [2/3] Running Backend Integration Tests...
call npm run test:integration
if errorlevel 1 goto :error

echo.
echo [3/3] Running Frontend Tests...
cd ..\frontend
if exist node_modules (
    call npm run test
    if errorlevel 1 goto :error
) else (
    echo Frontend dependencies not installed. Run 'npm install' first.
    goto :error
)

echo.
echo ========================================
echo All tests completed successfully!
echo ========================================
pause
exit /b 0

:error
echo.
echo ========================================
echo Tests failed!
echo ========================================
pause
exit /b 1