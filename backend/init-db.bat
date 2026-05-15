@echo off
echo.
echo ========================================
echo    GRAFENDA DATABASE SETUP
echo ========================================
echo.

REM Navigate to backend directory
cd /d "%~dp0"

REM Run Node.js script to setup missing tables
echo Step 1: Setting up database tables...
node setup-tables.js

if errorlevel 1 (
    echo.
    echo ❌ Database setup failed!
    echo Please ensure:
    echo - MySQL/XAMPP is running
    echo - Database "grafenda" exists
    echo - .env file is configured correctly
    pause
    exit /b 1
)

echo.
echo ========================================
echo    ✅ DATABASE SETUP COMPLETED!
echo ========================================
echo.
echo Next steps:
echo 1. Refresh the registration page
echo 2. Try registering as freelancer again
echo.
pause


