@echo off
title WMSU Ipil Document Portal Launcher
echo Starting WMSU Ipil Document Portal...
echo.

cd /d "%~dp0"

echo Launching backend and frontend servers...
call npm run dev

echo.
echo Waiting for servers to initialize...
timeout /t 5 /nobreak >nul

echo Opening the portal in your default web browser...
start http://localhost:5173

echo.
echo You can minimize these command windows, but do not close them while using the portal.
timeout /t 3 >nul
