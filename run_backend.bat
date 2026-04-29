@echo off
title EMS Backend
cd /d D:\workspace\EMS\cp-ems-ruoyi
java -jar cp-ems-admin/target/cp-ems-admin.jar --spring.profiles.active=dev > startup_v5.log 2>&1
