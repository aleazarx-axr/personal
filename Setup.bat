@echo off
title WMSU Ipil - Desktop App Installer
echo =======================================================
echo          WMSU Ipil Document Portal Installer
echo =======================================================
echo.
cd /d "%~dp0"

echo [1/3] Converting your updated PNG logo to a Windows Icon (.ico)...
:: This uses npx to quickly convert the updated png into an ico file locally
call npx -y png-to-ico frontend\src\wmsu-logo.png > wmsu-logo.ico

if not exist wmsu-logo.ico (
    echo [ERROR] Failed to generate the .ico file. Ensure Node.js/NPM is installed.
    pause
    exit /b
)

echo [2/3] Generating background launcher and stop scripts...
:: Create the hidden VBScript for silent launch
> Private.vbs echo Set WshShell = CreateObject("WScript.Shell")
>> Private.vbs echo WshShell.CurrentDirectory = "%~dp0"
>> Private.vbs echo WshShell.Run "cmd /c cd backend ^&^& npm run dev", 0, False
>> Private.vbs echo WshShell.Run "cmd /c cd frontend ^&^& npm run dev", 0, False
>> Private.vbs echo WScript.Sleep 5000
>> Private.vbs echo WshShell.Run "http://localhost:5173"

:: Create the stop script
> Stop.bat echo @echo off
>> Stop.bat echo title Stopping WMSU Ipil Document Portal
>> Stop.bat echo echo Stopping all Node.js servers...
>> Stop.bat echo taskkill /IM node.exe /F
>> Stop.bat echo echo Servers have been successfully stopped!
>> Stop.bat echo timeout /t 3 ^^>nul

echo [3/3] Creating Desktop Shortcuts...
:: Write a temporary PowerShell script to generate the actual shortcuts on the Desktop
> create_shortcuts.ps1 echo $WshShell = New-Object -comObject WScript.Shell
>> create_shortcuts.ps1 echo $Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\MyWMSU Ipil.lnk")
>> create_shortcuts.ps1 echo $Shortcut.TargetPath = "wscript.exe"
>> create_shortcuts.ps1 echo $Shortcut.Arguments = """%~dp0Private.vbs"""
>> create_shortcuts.ps1 echo $Shortcut.WorkingDirectory = "%~dp0"
>> create_shortcuts.ps1 echo $Shortcut.IconLocation = "%~dp0wmsu-logo.ico"
>> create_shortcuts.ps1 echo $Shortcut.Save()
>> create_shortcuts.ps1 echo $Shortcut2 = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\Stop MyWMSU Ipil.lnk")
>> create_shortcuts.ps1 echo $Shortcut2.TargetPath = "%~dp0Stop.bat"
>> create_shortcuts.ps1 echo $Shortcut2.WorkingDirectory = "%~dp0"
>> create_shortcuts.ps1 echo $Shortcut2.Save()

:: Run the temporary script, then clean it up
powershell -ExecutionPolicy Bypass -File create_shortcuts.ps1
del create_shortcuts.ps1

echo.
echo =======================================================
echo Setup Complete!
echo You will now see "MyWMSU Ipil" and "Stop MyWMSU Ipil" on your Desktop.
echo =======================================================
echo.
pause
