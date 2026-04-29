@echo off
echo Starting Redis Server...
start "Redis" /min /D "D:\workspace\EMS\Redis" redis-server.exe redis.windows.conf

echo Waiting for Redis to start...
timeout /t 3 /nobreak >nul

echo Starting CP-EMS Backend...
cd /d D:\workspace\EMS\cp-ems-ruoyi
java -jar cp-ems-admin/target/cp-ems-admin.jar
pause
