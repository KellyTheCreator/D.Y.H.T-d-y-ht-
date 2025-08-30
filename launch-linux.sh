#!/bin/bash
# Dwight AI Audio DVR - Linux Launcher Script

echo "🦇 Starting Dwight AI Audio DVR..."
echo "================================="

# Check if AppImage exists
if [ -f "./Dwight.AppImage" ]; then
    echo "✅ Found Dwight AppImage, launching..."
    chmod +x ./Dwight.AppImage
    ./Dwight.AppImage
elif [ -f "./src-tauri/target/release/bundle/appimage/dwight_0.1.0_amd64.AppImage" ]; then
    echo "✅ Found built AppImage, launching..."
    chmod +x "./src-tauri/target/release/bundle/appimage/dwight_0.1.0_amd64.AppImage"
    ./src-tauri/target/release/bundle/appimage/dwight_0.1.0_amd64.AppImage
elif [ -f "./src-tauri/target/release/dwight" ]; then
    echo "✅ Found debug binary, launching..."
    ./src-tauri/target/release/dwight
else
    echo "❌ No Dwight executable found!"
    echo ""
    echo "To build Dwight AI Audio DVR:"
    echo "1. npm install"
    echo "2. npm run tauri:build"
    echo ""
    echo "Or download a pre-built release from:"
    echo "https://github.com/dyhtcreator/DYHT-TAURI-short/releases"
    exit 1
fi