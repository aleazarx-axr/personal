@echo off
title Stopping WMSU Ipil Document Portal
echo Stopping all Node.js servers...
taskkill /IM node.exe /F
echo Servers have been successfully stopped!
