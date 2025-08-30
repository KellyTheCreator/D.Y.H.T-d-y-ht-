#!/bin/bash
# Dwight AI Audio DVR - macOS Launcher Script

echo "🦇 Starting Dwight AI Audio DVR..."
echo "================================="

# Check if .app bundle exists
if [ -d "./Dwight.app" ]; then
    echo "✅ Found Dwight.app bundle, launching..."
    open ./Dwight.app
elif [ -d "./src-tauri/target/release/bundle/macos/Dwight.app" ]; then
    echo "✅ Found built .app bundle, launching..."
    open ./src-tauri/target/release/bundle/macos/Dwight.app
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