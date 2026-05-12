@echo off
echo ========================================
echo    GRAFENDA BACKEND SETUP SCRIPT
echo ========================================
echo.

echo Step 1: Creating database...
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS grafenda_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if %errorlevel% neq 0 (
    echo ❌ Failed to create database. Please check your MySQL credentials.
    pause
    exit /b 1
)
echo ✅ Database created successfully!

echo.
echo Step 2: Importing database schema...
mysql -u root -p grafenda_db < database_schema.sql
if %errorlevel% neq 0 (
    echo ❌ Failed to import database schema.
    pause
    exit /b 1
)
echo ✅ Database schema imported successfully!

echo.
echo Step 3: Testing database connection...
npm run test-db
if %errorlevel% neq 0 (
    echo ❌ Database connection test failed.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    🎉 SETUP COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env file with your database password
echo 2. Run 'npm run dev' to start the server
echo 3. API will be available at http://localhost:3000
echo.
pause