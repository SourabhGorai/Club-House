@echo off
REM Quick Start Script for Microservices (Windows)

echo ========================================================
echo    Microservices Docker Setup - Quick Start
echo ========================================================
echo.

REM Check if .env exists
if not exist .env (
    echo ERROR: .env file not found!
    echo.
    echo Please create a .env file from .env.example:
    echo   copy .env.example .env
    echo.
    echo Then edit .env with your actual credentials.
    pause
    exit /b 1
)

echo [OK] .env file found
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running!
    echo.
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [OK] Docker is running
echo.

echo Starting all microservices...
echo.
echo This will:
echo   1. Build all Docker images (first time takes 5-10 minutes)
echo   2. Start Eureka Server
echo   3. Start API Gateway
echo   4. Start all microservices
echo.

set /p CONTINUE=Continue? (y/n): 
if /i not "%CONTINUE%"=="y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo Building and starting services...
docker-compose up --build -d

echo.
echo Waiting for services to start...
timeout /t 30 /nobreak >nul

echo.
echo Service Status:
docker-compose ps

echo.
echo [OK] Services are starting!
echo.
echo Important URLs:
echo    Eureka Dashboard: http://localhost:8761
echo    API Gateway:      http://localhost:8080
echo.
echo To view logs:
echo    docker-compose logs -f
echo.
echo To stop all services:
echo    docker-compose down
echo.
echo Happy coding!
pause
