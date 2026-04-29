@echo off
setlocal enabledelayedexpansion

:: Get current directory (cp-ems-ruoyi)
set "PROJECT_ROOT=%~dp0"
:: Get workspace root (EMS)
pushd "%PROJECT_ROOT%.."
set "WORKSPACE_ROOT=%CD%"
popd

:: Set Component Paths
set "REDIS_DIR=%WORKSPACE_ROOT%\Redis"
set "MARIADB_BIN=D:\workspace\pms\env\mariadb-10.6.16-winx64\bin"
set "MARIADB_DATA_DIR=%WORKSPACE_ROOT%\mariadb-data"
set "BACKEND_JAR=%PROJECT_ROOT%cp-ems-admin\target\cp-ems-admin.jar"
set "FRONTEND_DIR=%PROJECT_ROOT%cp-ems-ui"

title EMS One-Key Startup

echo ========================================================
echo               EMS System Startup Script
echo ========================================================
echo Project Root:   %PROJECT_ROOT%
echo Workspace Root: %WORKSPACE_ROOT%
echo.

:: 1. Start Redis
echo [1/4] Starting Redis...
if exist "%REDIS_DIR%\redis-server.exe" (
    start "Redis Server" /D "%REDIS_DIR%" redis-server.exe redis.windows.conf
    echo    - Redis started.
) else (
    echo    [ERROR] Redis not found at %REDIS_DIR%
)

:: 2. Start MariaDB
echo [2/4] Starting MariaDB...
if exist "%MARIADB_BIN%\mysqld.exe" (
    start "MariaDB Server" "%MARIADB_BIN%\mysqld.exe" --defaults-file="%MARIADB_DATA_DIR%\my.ini" --console
    echo    - MariaDB started.
) else (
    echo    [ERROR] MariaDB not found at %MARIADB_BIN%
)

:: Wait for DB
echo.
echo Waiting 10 seconds for Database initialization...
timeout /t 10 /nobreak >nul

:: 3. Start Backend
echo [3/4] Starting Backend Service...
if exist "%BACKEND_JAR%" (
    cd /d "%PROJECT_ROOT%"
    start "EMS Backend" java -jar "%BACKEND_JAR%" --spring.profiles.active=dev
    echo    - Backend service started (Port 8088).
) else (
    echo    [ERROR] Backend JAR not found at "%BACKEND_JAR%"
    echo    Please run 'mvn clean install' first.
)

:: 4. Start Frontend
echo [4/4] Starting Frontend UI...
if exist "%FRONTEND_DIR%" (
    cd /d "%FRONTEND_DIR%"
    set NODE_OPTIONS=--openssl-legacy-provider
    start "EMS Frontend" npm run dev
    echo    - Frontend started.
) else (
    echo    [ERROR] Frontend directory not found at "%FRONTEND_DIR%"
)

echo.
echo ========================================================
echo           All services have been triggered.
echo ========================================================
echo.
pause
