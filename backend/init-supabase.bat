@echo off
echo.
echo ========================================
echo    GRAFENDA SUPABASE DATABASE SETUP
echo ========================================
echo.

REM Navigate to backend directory
cd /d "%~dp0"

REM Run Node.js script to setup Supabase tables
echo Step 1: Setting up Supabase database tables...
node init-supabase.js

if errorlevel 1 (
    echo.
    echo ❌ Supabase setup failed!
    echo Please ensure:
    echo - Your Internet connection is active
    echo - Your .env file contains DATABASE_URL or correct DB_* parameters
    pause
    exit /b 1
)

echo.
echo ========================================
echo    ✅ SUPABASE SETUP COMPLETED!
echo ========================================
echo.
pause
