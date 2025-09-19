# 🤖 AI Models Setup Guide - DYHT

This guide explains how to enable **real AI models** (Llama3, Mistral, Gemma) in DYHT instead of the demo mode.

## 🎯 Quick Setup (3 Steps)

### 1. Install Ollama
Visit [ollama.ai](https://ollama.ai) and download for your operating system:
- **Windows**: Download and run the installer
- **macOS**: Download the .dmg file
- **Linux**: Run `curl -fsSL https://ollama.ai/install.sh | sh`

### 2. Download AI Models
Open terminal/command prompt and run:
```bash
# Install the models you want to use
ollama pull llama3       # Llama 3 (recommended)
ollama pull mistral      # Mistral 7B
ollama pull gemma:7b     # Gemma 7B
```

### 3. Start Ollama Service
```bash
ollama serve
```

## 🔄 Verify Setup

1. **Start DYHT** (either `npm run dev` or the desktop app)
2. **Check AI Models Status** in the dashboard
3. **Click the refresh button (🔄)** next to "AI Models Status"
4. **Look for green indicators**: 🟢 means the model is active and ready

## 💬 Test Chat

Once setup is complete:
- Chat with Dwight will use **real AI models** instead of demo responses
- You'll get much more intelligent and contextual responses
- The models will provide better audio analysis and assistance

## 🔧 Troubleshooting

### Models show as 🔴 (inactive)
- Ensure Ollama is running: `ollama serve`
- Check that models are downloaded: `ollama list`
- Refresh the status in DYHT

### Chat still seems like demo mode
- Verify green status indicators in the dashboard
- Try asking a complex question to test real AI response
- Restart DYHT after setting up Ollama

### Connection issues
- Make sure Ollama is running on port 11434
- Check firewall settings
- Try restarting both Ollama and DYHT

## 🎉 What Changes

**Before (Demo Mode)**:
- Simulated responses from Dwight
- Basic audio analysis capabilities
- Limited conversation context

**After (Real AI)**:
- Intelligent responses from Llama3/Mistral/Gemma
- Advanced audio analysis and insights
- Rich conversational context and memory
- RAG (Retrieval-Augmented Generation) support

## 📞 Need Help?

The DYHT interface now provides clear guidance when AI models are offline. Look for the **"🔗 AI Models Offline"** notification for setup instructions.