# 🦇 Dwight AI Audio DVR - Your Brilliant Audio Assistant

![Dwight AI Dashboard](https://github.com/user-attachments/assets/1a2a3a07-4842-4ff9-9bf0-7c3f81421641)

Welcome to **Dwight AI Audio DVR** - a revolutionary cross-platform desktop application designed for privacy-first, always-on audio sensing with AI-powered analysis. Think of it as a DVR for real life audio! "Never again miss what was said!"

## 🚀 How to Start Using Dwight AI

### ⚡ Super Quick Start (5 minutes or less!)
**📖 [Quick Start Guide](./QUICKSTART.md)** - Get running in under 5 minutes!

### 📋 Platform-Specific Instructions

**Windows (PowerShell/Command Prompt):**
```powershell
# Option 1: Use the launcher script
.\launch-windows.bat

# Option 2: Run directly (if you have the exe)
.\Dwight.exe

# Option 3: Build from source
npm install
npm run tauri:build
```

**macOS (Terminal):**
```bash
# Option 1: Use the launcher script
./launch-macos.sh

# Option 2: Run directly (if you have the app)
open ./Dwight.app

# Option 3: Build from source
npm install && npm run tauri:build
```

**Linux (Terminal):**
```bash
# Option 1: Use the launcher script
./launch-linux.sh

# Option 2: Run AppImage directly
chmod +x Dwight.AppImage && ./Dwight.AppImage

# Option 3: Build from source
npm install && npm run tauri:build
```

### 📚 Complete Documentation
- **[Installation Guide](./INSTALLATION.md)** - Comprehensive setup for all platforms
- **[Setup Guide](./SETUP.md)** - Developer configuration and advanced options

## 🚀 Quick Start

### For End Users (Just Want to Use the App)
**📖 [Complete Installation Guide](./INSTALLATION.md)** - Step-by-step instructions for Windows, macOS, and Linux
**⚡ [Quick Start Guide](./QUICKSTART.md)** - Get running in 5 minutes!

**Windows (PowerShell):**
```powershell
# Download the latest release and run:
.\Dwight.exe
```

**macOS (Terminal):**
```bash
# Download the latest release and run:
open ./Dwight.app
```

**Linux (Terminal):**
```bash
# Download the latest release and run:
chmod +x Dwight.AppImage
./Dwight.AppImage
```

### For Developers (Want to Build/Modify)
```bash
# Clone and setup
git clone https://github.com/dyhtcreator/DYHT-TAURI-short.git
cd DYHT-TAURI-short

# Install dependencies
npm install

# Run in development mode
npm run tauri:dev

# Build for production
npm run tauri:build
```

## ✨ Features

### 🧠 Dwight AI Intelligence
- **Brilliant AI personality** with specialized knowledge in audio analysis and security
- **Persistent memory** using SQLite database to learn from conversations
- **Contextual awareness** that references previous interactions
- **Voice input support** using Web Speech API for hands-free operation
- **Confidence scoring** system for response quality assessment

### 🎵 Audio Processing & Analysis
- **Real-time audio recording** with Web Audio API integration
- **Live waveform visualization** (circular for Dwight, linear for review)
- **Audio transcription engine** built in Rust backend
- **Pattern detection** for non-verbal sounds (footsteps, gunshots, crying, etc.)
- **Intelligent audio analysis** with confidence metrics

### ⚡ Smart Trigger System
- **Manual triggers** for immediate recording activation
- **Sound-activated triggers** for detecting specific audio patterns
- **Speech-activated triggers** for keyword detection (help, emergency, danger)
- **Persistent trigger storage** in SQLite database
- **Real-time trigger management** with visual feedback

## 🎯 Use Cases

### Personal & Family
- **Memory aide** for important conversations and meetings
- **Parenting helper** for monitoring baby crying and sleep patterns
- **Learning tool** for autistic children and real-time development aid
- **Accessibility support** for deaf and hard-of-hearing individuals

### Professional & Security
- **Forensic audio analysis** for investigation purposes
- **Security monitoring** with intelligent pattern recognition
- **Meeting transcription** with speaker identification
- **Evidence collection** with timestamp and metadata logging

## 🔒 Privacy & Security

Dwight AI Audio DVR is built with privacy-first principles:
- ✅ **Local Processing** - All transcription happens on your device
- ✅ **No Cloud Upload** - Audio data never leaves your computer
- ✅ **Encrypted Storage** - Local SQLite database with encryption
- ✅ **Minimal Permissions** - Only microphone access when needed
- ✅ **Open Source** - Full transparency with source code review

## 🛠️ Technical Architecture

```
Frontend (React/TypeScript)
├── Audio Recording (Web Audio API)
├── Waveform Visualization (SVG)
├── Real-time Chat Interface
└── Trigger Management

Backend (Rust/Tauri)
├── Audio Transcription Engine
├── AI Processing (Dwight Intelligence)
├── SQLite Database (Persistent Memory)
└── Security & Privacy Layer
```

## 📦 System Requirements

### Minimum Requirements
- **OS:** Windows 10, macOS 10.15, or Linux with GTK 3.24+
- **RAM:** 4GB (8GB recommended)
- **Storage:** 500MB free space
- **CPU:** 64-bit processor

### Recommended
- **RAM:** 8GB or more for smooth real-time processing
- **Storage:** 2GB+ for audio recording storage
- **Audio:** Dedicated microphone for best transcription quality

## 🚀 Getting Started

1. **Download** the latest release for your platform
2. **Install** following the platform-specific instructions
3. **Grant** microphone permissions when prompted
4. **Chat** with Dwight to test the AI functionality
5. **Configure** audio triggers for your use case
6. **Start** recording and analyzing your audio!

## 📚 Documentation

- **[Installation Guide](./INSTALLATION.md)** - Complete setup instructions
- **[Setup Guide](./SETUP.md)** - Developer and advanced configuration
- **[AI Models Integration](./AI_MODELS.md)** - How to plug in your AI models
- **[User Manual](./docs/USER_GUIDE.md)** - Detailed feature documentation
- **[API Documentation](./docs/API.md)** - Integration and development

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details on:
- Code style and standards
- Bug reporting and feature requests
- Development setup and testing
- Pull request process

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 📞 Support

Need help? Here's how to get support:
- **📖 Documentation** - Check the installation and user guides
- **🐛 Issues** - Report bugs or request features on GitHub
- **💬 Discussions** - Join community discussions
- **📧 Contact** - Reach out for security issues

---

**Made with ❤️ by the Dwight AI team**

*Transform your audio experience with AI-powered analysis and never miss important sounds again!*