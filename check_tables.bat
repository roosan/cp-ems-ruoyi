@echo off
"D:\workspace\pms\env\mariadb-10.6.16-winx64\bin\mysql.exe" -u root -pjyx123 -e "use cp_ems_ruoyi; show tables like 'sys_config'; show tables like 'sys_oss_config';"
