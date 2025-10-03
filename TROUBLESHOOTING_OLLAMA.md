# Troubleshooting Ollama Connection Issues

## Problem: "I have Ollama running with llama3 pulled, but still getting demo mode responses!"

This guide helps you diagnose and fix connection issues between Dwight and Ollama.

---

## Quick Diagnostic Steps

### Step 1: Verify Ollama is Actually Running

**Open PowerShell/Terminal and run:**
```bash
# Check if Ollama is running
ollama list

# Should show something like:
# NAME              ID           SIZE    MODIFIED
# llama3.2:latest  a80c4f17a1   2.0GB   2 hours ago
```

**If you don't see any models:**
```bash
# Install a model
ollama pull llama3.2
```

**If `ollama` command not found:**
- Ollama is not installed or not in PATH
- Install from: https://ollama.ai
- Make sure to restart terminal after installation

---

### Step 2: Test Ollama Connection

**In PowerShell/Terminal:**
```bash
# Start Ollama service (if not already running)
ollama serve

# In a NEW terminal window, test the model
ollama run llama3.2 "What is 2+2?"

# Should get a response like "4" or "The answer is 4"
```

**If this works:** Ollama is functioning correctly! The problem is Dwight's connection to it.

**If this fails:** Fix Ollama first before continuing.

---

### Step 3: Open Dwight Console Logs

**In Dwight application:**
1. Press **F12** to open Developer Console
2. Click the **Console** tab
3. Clear any old messages (trash icon)
4. Ask Dwight any question (e.g., "What is 2+2?")
5. **Watch the console messages with emoji indicators**

---

## Interpreting Console Messages

### ✅ Success Path (Everything Working)
```
🔍 Environment check: Tauri=YES (Desktop), __TAURI_IPC__=true
🖥️ Desktop mode detected - attempting AI chat...
🔍 Ollama connection check: ✅ Available
🤖 Priority 1: Attempting direct AI model chat...
📋 Found 2 Ollama model(s): ['llama3.2:latest', 'mistral:latest']
✅ Selected model: llama3.2:latest (matched pattern: llama3.2)
🚀 Sending request to Ollama with model: llama3.2:latest
⏱️ Timeout set to 60 seconds (first request may take 30-60s)
[Wait 30-60 seconds on first request - BE PATIENT!]
⏱️ Request completed in 45.3s
✅ Ollama response received successfully (287 chars, 52 tokens)
✅ Direct AI model chat successful!
```

**Result:** You get a real AI response! 🎉

---

### ❌ Problem 1: No Models Detected
```
🔍 Environment check: Tauri=YES (Desktop), __TAURI_IPC__=true
🖥️ Desktop mode detected - attempting AI chat...
🔍 Ollama connection check: ✅ Available
🤖 Priority 1: Attempting direct AI model chat...
📋 Found 0 Ollama model(s): []
❌ No models found! Available models list was empty.
💡 This usually means:
   1. No models are installed (run: ollama list)
   2. Ollama is running but no models pulled yet
   3. Timeout getting model list (Ollama slow to respond)
```

**Diagnosis:** Dwight can connect to Ollama, but can't see any models.

**Solutions:**

1. **Check if models are actually installed:**
   ```bash
   ollama list
   ```
   
2. **If models shown but Dwight doesn't see them:**
   - Ollama may be slow to respond
   - Wait 10-20 seconds and try again
   - Restart Ollama: Stop it (Ctrl+C) and run `ollama serve` again

3. **If no models shown:**
   ```bash
   ollama pull llama3.2
   ollama list  # Verify it's there
   ```

4. **Check Ollama API directly:**
   ```bash
   curl http://localhost:11434/api/tags
   ```
   Should return JSON with model list. If this times out, Ollama is not responding.

---

### ❌ Problem 2: Request Timeout
```
🔍 Environment check: Tauri=YES (Desktop), __TAURI_IPC__=true
🖥️ Desktop mode detected - attempting AI chat...
🔍 Ollama connection check: ✅ Available
🤖 Priority 1: Attempting direct AI model chat...
📋 Found 1 Ollama model(s): ['llama3.2:latest']
✅ Selected model: llama3.2:latest (matched pattern: llama3.2)
🚀 Sending request to Ollama with model: llama3.2:latest
⏱️ Timeout set to 60 seconds (first request may take 30-60s)
[Wait 60 seconds]
❌ Ollama request timed out after 60 seconds
💡 Model 'llama3.2:latest' may still be loading
💡 Try again in 10-20 seconds
```

**Diagnosis:** Model is taking longer than 60 seconds to load.

**Solutions:**

1. **This is NORMAL for large models on first request!**
   - Large models (7B+) can take 60-120 seconds to load
   - Wait 10-20 seconds and **try again**
   - Second request should be FAST (1-3 seconds)

2. **Use a smaller model:**
   ```bash
   ollama pull llama3.2:1b  # Only 1.3GB, loads faster
   ```

3. **Check system resources:**
   - Open Task Manager / Activity Monitor
   - Look for `ollama` process
   - Check if it's using lots of RAM (normal)
   - Check if system is low on RAM (problem)
   - Close other applications to free RAM

4. **Try running manually first:**
   ```bash
   # This will pre-load the model
   ollama run llama3.2 "test"
   ```
   Then try Dwight again - should be faster since model is already loaded.

---

### ❌ Problem 3: Cannot Connect to Ollama
```
🔍 Environment check: Tauri=YES (Desktop), __TAURI_IPC__=true
🖥️ Desktop mode detected - attempting AI chat...
🔍 Ollama connection check: ❌ Not available
❌ Ollama is not running. Cannot provide AI responses.
```

**Diagnosis:** Ollama service is not running.

**Solutions:**

1. **Start Ollama service:**
   ```bash
   ollama serve
   ```
   Leave this terminal window open!

2. **Check if something is using port 11434:**
   ```bash
   # Windows
   netstat -ano | findstr :11434
   
   # Linux/Mac
   lsof -i :11434
   ```
   
3. **Try a different port (advanced):**
   ```bash
   # Set environment variable
   set OLLAMA_HOST=127.0.0.1:11435  # Windows
   export OLLAMA_HOST=127.0.0.1:11435  # Linux/Mac
   
   # Start Ollama
   ollama serve
   ```
   Note: Dwight is hardcoded to use port 11434, so this won't help unless you modify Dwight too.

4. **Check firewall settings:**
   - Make sure firewall isn't blocking localhost:11434
   - Try temporarily disabling firewall to test

---

### ❌ Problem 4: Running in Web Mode (Not Desktop App)
```
🔍 Environment check: Tauri=NO (Web), __TAURI_IPC__=undefined
🌐 Web mode detected - attempting Ollama connection...
```

**Diagnosis:** You're running the web version, not the desktop app.

**Why this matters:** Web version has limited access to system resources.

**Solutions:**

1. **Make sure you built the desktop app:**
   ```bash
   npm run tauri:build
   ```
   This takes 45+ minutes. Be patient!

2. **Run the built executable:**
   - Windows: `src-tauri/target/release/dwight-tauri.exe`
   - Mac: `src-tauri/target/release/bundle/macos/Dwight.app`
   - Linux: `src-tauri/target/release/dwight-tauri`

3. **If build fails on Ubuntu 24.04:**
   - Known webkit2gtk compatibility issue
   - Use Windows or Mac for desktop build
   - Or use web mode (works fine, just limited features)

4. **Web mode CAN still connect to Ollama!**
   - Just make sure Ollama is running: `ollama serve`
   - Console should show: `🌐 Web mode - attempting AI chat...`
   - Then same diagnostics apply as desktop mode

---

## Common Mistakes

### ❌ Mistake 1: Not Starting Ollama Service
**Symptom:** Console shows "Ollama connection check: ❌ Not available"

**Fix:** Run `ollama serve` in a terminal and leave it running

---

### ❌ Mistake 2: Model Not Installed
**Symptom:** Console shows "📋 Found 0 Ollama model(s): []"

**Fix:** Run `ollama pull llama3.2` and wait for it to download

---

### ❌ Mistake 3: Expecting First Request to be Fast
**Symptom:** Console shows "⏱️ Request completed in 45.3s" and you think it's broken

**Reality:** This is NORMAL! First request loads model into memory (30-60s). Subsequent requests are fast (1-3s).

---

### ❌ Mistake 4: Not Waiting for Model to Load
**Symptom:** Console shows timeout after 60s

**Fix:** Wait 10-20 seconds and try again. Model is probably loaded now, next request will work.

---

### ❌ Mistake 5: Using Very Large Models on Slow Hardware
**Symptom:** Timeouts, very slow responses, system freezes

**Fix:** Use smaller models:
```bash
ollama pull llama3.2:1b  # Only 1.3GB
ollama pull phi3:mini     # Only 2GB
```

---

## Advanced Debugging

### Check Ollama API Directly

**Test model list endpoint:**
```bash
curl http://localhost:11434/api/tags
```

**Expected response:**
```json
{
  "models": [
    {
      "name": "llama3.2:latest",
      "modified_at": "2024-10-02T20:15:30Z",
      "size": 2011928064
    }
  ]
}
```

**Test generation endpoint:**
```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "What is 2+2?",
  "stream": false
}'
```

**If these curl commands fail:** The problem is with Ollama, not Dwight!

---

### Enable Ollama Debug Logging

**Windows:**
```cmd
set OLLAMA_DEBUG=1
ollama serve
```

**Linux/Mac:**
```bash
export OLLAMA_DEBUG=1
ollama serve
```

This shows detailed logs from Ollama about what it's doing.

---

### Check Dwight Console for Network Errors

Look for these specific errors:

**"Failed to fetch"** = Cannot connect to Ollama at all
- Ollama not running
- Wrong port
- Firewall blocking

**"404 Not Found"** = Model doesn't exist
- Wrong model name
- Model not pulled

**"AbortError"** = Timeout
- Model still loading
- System too slow
- Increase timeout (already 60s)

---

## Performance Expectations

| Scenario | Expected Time | What's Happening |
|----------|---------------|------------------|
| First request (cold start) | 30-60 seconds | Model loading into RAM |
| Subsequent requests | 1-3 seconds | Model already in memory |
| Small models (1B-3B) | 10-30 seconds | Less data to load |
| Large models (13B+) | 60-120 seconds | More data to load |
| Very large models (70B+) | 120-300 seconds | Requires powerful hardware |

**Normal behavior:**
- Request 1: 45 seconds ⏱️ (loading)
- Request 2: 2 seconds ⚡ (fast!)
- Request 3: 2 seconds ⚡
- Request 4: 2 seconds ⚡

**If all requests are slow:** Model not staying in memory, system issue.

---

## Still Not Working?

### Provide This Information:

1. **Your console output** (copy/paste the emoji messages)
2. **Output of:** `ollama list`
3. **Output of:** `curl http://localhost:11434/api/tags`
4. **Your system specs:**
   - RAM amount
   - Operating System
   - CPU model

5. **Which app you're running:**
   - Desktop .exe built with `npm run tauri:build`?
   - Web version with `npm run dev`?
   - Pre-built release from GitHub?

### Create a GitHub Issue

Include all the above information plus:
- Screenshots of console with emoji indicators
- What response Dwight gave you
- What you expected to happen

---

## Summary

**Most common issues:**
1. ❌ Ollama service not running → Run `ollama serve`
2. ❌ No models installed → Run `ollama pull llama3.2`
3. ❌ First request timing out → Wait 10-20s and try again
4. ❌ Model list timeout → Already fixed, wait 10s and retry
5. ❌ Running web mode → Build desktop app or use web mode properly

**Key insight:** If you can run `ollama run llama3.2 "test"` successfully in terminal, then Ollama is working. The issue is Dwight's connection to it. Use the console logs to see exactly where the connection is failing!
