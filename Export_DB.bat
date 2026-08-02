@echo off
title Exporting Database
echo ===========================================
echo    Database Exporter (WMSU Ipil Portal)
echo ===========================================
echo.
cd /d "%~dp0"
cd backend
echo Exporting database...
node export_db.js
echo.
pause
