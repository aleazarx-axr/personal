@echo off
title Importing Database
echo ===========================================
echo    Database Importer (WMSU Ipil Portal)
echo ===========================================
echo.
echo Make sure you have a "database.sql" file in this folder!
echo Also make sure your MySQL server (like XAMPP) is running.
echo.
pause
cd /d "%~dp0"
cd backend
echo Importing database...
node import_db.js
echo.
pause
