# 🦇 Dwight AI Audio DVR - Installation & Startup Guide

Welcome to Dwight AI Audio DVR! This guide provides complete step-by-step instructions for installing and running the application on Windows, macOS, and Linux.

## 📋 Table of Contents
1. [Quick Start (For End Users)](#quick-start-for-end-users)
2. [Developer Setup](#developer-setup)
3. [Building from Source](#building-from-source)
4. [Troubleshooting](#troubleshooting)
5. [System Requirements](#system-requirements)

---

## 🚀 Quick Start (For End Users)

### Windows
```powershell
# Option 1: Download pre-built executable (recommended)
# 1. Go to the Releases page on GitHub
# 2. Download "Dwight-Setup.exe" for Windows
# 3. Double-click the installer and follow the prompts
# 4. Launch "Dwight" from your Start Menu or Desktop

# Option 2: Run from PowerShell (if you have the portable version)
.\Dwight.exe
```

### macOS
```bash
# Option 1: Download pre-built app bundle (recommended)
# 1. Go to the Releases page on GitHub
# 2. Download "Dwight.dmg" for macOS
# 3. Open the DMG file and drag Dwight.app to Applications
# 4. Launch from Applications folder or Spotlight

# Option 2: Run from Terminal (if you have the portable version)
open ./Dwight.app
```

### Linux
```bash
# Option 1: Download pre-built AppImage (recommended)
# 1. Go to the Releases page on GitHub
# 2. Download "Dwight.AppImage" for Linux
# 3. Make it executable and run:
chmod +x Dwight.AppImage
./Dwight.AppImage

# Option 2: Install via package manager (if available)
# Ubuntu/Debian:
sudo dpkg -i dwight_0.1.0_amd64.deb

# Fedora/RHEL:
sudo rpm -i dwight-0.1.0.x86_64.rpm
```

---

## 🛠️ Developer Setup

### Prerequisites

Before starting, ensure you have the following installed:

#### 1. Node.js (v18 or later)
```bash
# Windows (using chocolatey)
choco install nodejs

# macOS (using homebrew)
brew install node

# Linux (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### 2. Rust & Cargo
```bash
# All platforms
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env
```

#### 3. System Dependencies

**Windows:**
```powershell
# Install Microsoft C++ Build Tools
# Download from: https://visualstudio.microsoft.com/visual-cpp-build-tools/
```

**macOS:**
```bash
# Install Xcode Command Line Tools
xcode-select --install
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install -y \
    libwebkit2gtk-4.0-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libasound2-dev \
    pkg-config
```

**Linux (Fedora/RHEL):**
```bash
sudo dnf install -y \
    webkit2gtk3-devel \
    openssl-devel \
    curl \
    wget \
    libappindicator-gtk3-devel \
    librsvg2-devel \
    alsa-lib-devel
```

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/dyhtcreator/DYHT-TAURI-short.git
cd DYHT-TAURI-short
```

2. **Install dependencies**
```bash
# Install Node.js dependencies
npm install

# Install Tauri CLI
npm install -g @tauri-apps/cli
```

3. **Run in development mode**
```bash
# Start the web development server
npm run dev

# OR run the desktop app in development mode
npm run tauri:dev
```

---

## 🏗️ Building from Source

### Build for Web (Browser)
```bash
# Build for web deployment
npm run build

# Preview the built web app
npm run preview
```

### Build Desktop Application
```bash
# Build the desktop application for your platform
npm run tauri:build
```

After building, you'll find the executables in:
- **Windows:** `src-tauri/target/release/bundle/msi/` and `src-tauri/target/release/bundle/nsis/`
- **macOS:** `src-tauri/target/release/bundle/dmg/` and `src-tauri/target/release/bundle/macos/`
- **Linux:** `src-tauri/target/release/bundle/appimage/` and `src-tauri/target/release/bundle/deb/`

### Cross-Platform Building
```bash
# Add target platforms (only needed once)
rustup target add x86_64-pc-windows-msvc
rustup target add x86_64-apple-darwin
rustup target add x86_64-unknown-linux-gnu

# Build for specific platforms
tauri build --target x86_64-pc-windows-msvc
tauri build --target x86_64-apple-darwin
tauri build --target x86_64-unknown-linux-gnu
```

---

## 🔧 Troubleshooting

### Common Issues

#### "Command not found: tauri"
```bash
# Install Tauri CLI globally
npm install -g @tauri-apps/cli

# Or use with npx
npx tauri dev
```

#### Audio permissions not working
- **Windows:** Ensure microphone access is enabled in Windows Privacy Settings
- **macOS:** Grant microphone permissions when prompted, or check System Preferences > Security & Privacy > Microphone
- **Linux:** Ensure your user is in the `audio` group: `sudo usermod -a -G audio $USER`

#### Build fails on Linux
```bash
# Install additional dependencies
sudo apt install -y build-essential libssl-dev pkg-config
```

#### "WebKit2GTK not found" on Linux
```bash
# Ubuntu/Debian
sudo apt install libwebkit2gtk-4.0-dev

# Fedora
sudo dnf install webkit2gtk3-devel
```

### Performance Optimization

For better audio processing performance:
```bash
# Linux: Use JACK audio system for professional audio
sudo apt install jackd2
```

---

## 💻 System Requirements

### Minimum Requirements
- **RAM:** 4GB (8GB recommended)
- **Storage:** 500MB free space
- **CPU:** 64-bit processor
- **OS:** 
  - Windows 10 (version 1903 or later)
  - macOS 10.15 (Catalina) or later
  - Linux with GTK 3.24+ and WebKit2GTK

### Recommended Requirements
- **RAM:** 8GB or more
- **Storage:** 2GB free space (for audio recordings)
- **CPU:** Multi-core processor for real-time audio processing
- **Audio:** Dedicated microphone for best transcription quality

---

## 🎯 First Launch

Once Dwight is running:

1. **Grant Permissions:** Allow microphone access when prompted
2. **Test Audio:** Click "Record Now" to test audio recording
3. **Chat with Dwight:** Type "Hello Dwight" in the chat interface
4. **Setup Triggers:** Configure audio triggers for specific sounds
5. **Explore Features:** Try voice input, waveform visualization, and audio analysis

### Default Keyboard Shortcuts
- `Ctrl/Cmd + R`: Start/Stop recording
- `Ctrl/Cmd + T`: Toggle Dwight chat
- `Space`: Push-to-talk for voice input
- `Esc`: Stop current recording

---

## 📚 Additional Resources

- **User Manual:** See `docs/USER_GUIDE.md` for detailed feature documentation
- **API Documentation:** See `docs/API.md` for integration details
- **Troubleshooting:** Check the GitHub Issues page for known problems
- **Community:** Join our Discord server for support and discussions

---

## 🔒 Privacy & Security

Dwight AI Audio DVR is designed with privacy-first principles:
- ✅ **Local Processing:** All audio transcription happens on your device
- ✅ **No Cloud Upload:** Audio data never leaves your computer
- ✅ **Encrypted Storage:** Local database is encrypted
- ✅ **Minimal Permissions:** Only requests microphone access when needed
- ✅ **Open Source:** Full source code available for security review

---

## 📞 Support

Need help? Here's how to get support:

1. **Check Documentation:** Review this guide and the user manual
2. **Search Issues:** Look through existing GitHub issues
3. **Create an Issue:** Report bugs or request features on GitHub
4. **Community Help:** Ask questions in our Discord server

**Contact Information:**
- GitHub: https://github.com/dyhtcreator/DYHT-TAURI-short
- Issues: https://github.com/dyhtcreator/DYHT-TAURI-short/issues
- Email: support@dwight-ai.com (for security issues)

---

*Last updated: $(date +%Y-%m-%d)*
*Version: 0.1.0*