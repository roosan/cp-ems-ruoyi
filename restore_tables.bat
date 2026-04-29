@echo off
set MYSQL_BIN=D:\workspace\pms\env\mariadb-10.6.16-winx64\bin\mysql.exe

echo Restoring cp_ems.sql...
"%MYSQL_BIN%" -u root -pjyx123 -e "CREATE DATABASE IF NOT EXISTS cp_ems_ruoyi;"
"%MYSQL_BIN%" -u root -pjyx123 cp_ems_ruoyi < D:\workspace\EMS\cp-ems-ruoyi\script\sql\cp_ems.sql

echo Restoring fix_oss_table.sql...
"%MYSQL_BIN%" -u root -pjyx123 cp_ems_ruoyi < D:\workspace\EMS\cp-ems-ruoyi\fix_oss_table.sql

echo Done.
