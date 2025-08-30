@echo off
REM Dwight AI Audio DVR - Windows Launcher Script

echo 🦇 Starting Dwight AI Audio DVR...
echo =================================

REM Check if .exe exists
if exist "Dwight.exe" (
    echo ✅ Found Dwight.exe, launching...
    start "" "Dwight.exe"
) else if exist "src-tauri\target\release\bundle\msi\Dwight_0.1.0_x64_en-US.msi" (
    echo ✅ Found MSI installer, please install first...
    start "" "src-tauri\target\release\bundle\msi\Dwight_0.1.0_x64_en-US.msi"
) else if exist "src-tauri\target\release\dwight.exe" (
    echo ✅ Found debug binary, launching...
    start "" "src-tauri\target\release\dwight.exe"
) else (
    echo ❌ No Dwight executable found!
    echo.
    echo To build Dwight AI Audio DVR:
    echo 1. npm install
    echo 2. npm run tauri:build
    echo.
    echo Or download a pre-built release from:
    echo https://github.com/dyhtcreator/DYHT-TAURI-short/releases
    pause
    exit /b 1
)

REM Keep window open briefly to show any error messages
timeout /t 2 >nul