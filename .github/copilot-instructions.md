# Dwight AI Audio DVR - Copilot Instructions

**ALWAYS follow these instructions first and only fallback to additional search and context gathering if the information here is incomplete or found to be in error.**

## Project Overview

Dwight AI Audio DVR is a privacy-first cross-platform desktop application built with Tauri (Rust backend + React/TypeScript frontend) for audio sensing, transcription, and AI-powered analysis. Think of it as a DVR for real-life audio with an intelligent AI butler named Dwight.

### Key Principles
- **Privacy First**: All audio processing done locally, no cloud dependencies
- **Cross-Platform**: Windows, macOS, Linux support via Tauri
- **Modular AI**: Plug-in ready architecture for various AI models
- **Developer Friendly**: Comprehensive web development workflow

## Working Effectively

### Prerequisites & System Dependencies
**Ubuntu/Debian Linux:**
```bash
# REQUIRED: Install system dependencies before any build attempts
sudo apt update && sudo apt install -y \
    libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libasound2-dev \
    pkg-config \
    libglib2.0-dev \
    libsoup2.4-dev \
    libjavascriptcoregtk-4.1-dev
```

**Verify Prerequisites:**
```bash
# Check Node.js (requires v18+)
node --version  # Should show v18+ 

# Check Rust/Cargo
rustc --version && cargo --version
```

### Bootstrap, Build, and Setup Commands

**Complete setup (recommended for first time):**
```bash
# Full setup: installs deps + builds web frontend
npm run setup  # Takes ~25 seconds total. NEVER CANCEL.
```

**Individual setup steps:**
```bash
# 1. Install all dependencies (npm + cargo)
npm run install-deps  # Takes ~20 seconds. NEVER CANCEL.

# 2. Install only npm dependencies  
npm install  # Takes ~15 seconds. NEVER CANCEL.

# 3. Build web frontend only
npm run build  # Takes ~1-2 seconds. Very fast.

# 4. Clean build artifacts
npm run clean  # Removes dist/ and src-tauri/target/
```

### Development Workflow

**Web Development (ALWAYS WORKS):**
```bash
# Start development server for web interface
npm run dev  # Serves on http://localhost:5173/

# Preview built web application
npm run preview  # After running `npm run build`
```

**Desktop Development (PLATFORM DEPENDENT):**
```bash
# CRITICAL: Desktop builds have compatibility issues on Ubuntu 24.04
npm run tauri:dev  # FAILS on Ubuntu 24.04 due to webkit2gtk-4.0 vs 4.1 incompatibility

# Desktop production build  
npm run tauri:build  # FAILS on Ubuntu 24.04. Set timeout to 60+ minutes if attempting.
```

### Build Time Expectations & Timeouts

**NEVER CANCEL these commands - always set appropriate timeouts:**

- `npm install`: ~15 seconds - Set timeout to 60+ seconds
- `npm run build`: ~1-2 seconds - Set timeout to 30+ seconds  
- `npm run setup`: ~25 seconds - Set timeout to 120+ seconds
- `npm run tauri:build`: **45+ minutes if it works** - Set timeout to 3600+ seconds (60+ minutes). NEVER CANCEL.
- `npm run tauri:dev`: May hang on startup - Set timeout to 600+ seconds (10+ minutes)

**CRITICAL TIMING RULE:** NEVER CANCEL builds or long-running commands. Build times of 45+ minutes are NORMAL for Tauri applications.

## Platform Compatibility & Limitations

### ✅ What ALWAYS Works
- **Web Development**: `npm run dev` always works and serves full UI on localhost:5173
- **Web Builds**: `npm run build` produces working static web assets in `dist/`
- **Dependencies**: `npm install` and `npm run install-deps` work reliably
- **Frontend Development**: Full React/TypeScript development workflow

### ❌ Known Limitations
- **Ubuntu 24.04 Desktop Builds**: `npm run tauri:build` and `npm run tauri:dev` FAIL due to webkit2gtk-4.0 vs 4.1 incompatibility
- **No Test Framework**: Repository has no configured test runner (no jest, cypress, etc.)
- **TypeScript**: Code uses relaxed TypeScript settings to accommodate rapid development

### ⚠️ Desktop Build Workarounds
If desktop build fails with webkit/javascriptcore errors:
1. **Document the limitation** - do not try to "fix" webkit compatibility issues
2. **Focus on web development** - the web interface is fully functional
3. **Use platform-specific builds** - recommend users download pre-built releases
4. **Development alternative**: Test changes via web interface at localhost:5173

## Validation & Testing

### Manual Validation Steps
**ALWAYS validate changes using the web interface:**

1. **Start Development Server:**
   ```bash
   npm run dev  # Let it start completely
   ```

2. **Access Web Interface:**
   - Navigate to http://localhost:5173/
   - Verify Dwight AI dashboard loads completely
   - Test chat interface with Dwight AI butler

3. **Functional Validation:**
   - **Audio Dashboard**: Check waveform visualization, playback controls
   - **AI Models Status**: Verify status indicators (will show offline in web mode)  
   - **Triggers System**: Test sound/speech trigger management interface
   - **Chat Interface**: Interact with Dwight AI butler chat panel
   - **UI Responsiveness**: Verify all buttons, inputs, and panels work

4. **Build Validation:**
   ```bash
   npm run build  # Verify build succeeds
   ls -la dist/   # Confirm assets generated: index.html, assets/, images
   ```

### Expected Console Behavior
**Normal in web-only mode (not errors):**
- `window.__TAURI_IPC__ is not a function` - Expected when running without Tauri backend
- AI model status shows offline - Expected without Rust backend
- Audio recording may not work - Expected without native audio access

## Common Development Tasks

### File Structure & Navigation
```
src/
├── components/          # React components
│   ├── DwightAudioDashboard.tsx   # Main dashboard
│   ├── DraggableDwightPanel.tsx   # AI chat panel  
│   ├── AudioinputPanel.tsx        # Audio controls
│   ├── Waveform.tsx               # Audio visualization
│   └── Recorder.tsx               # Recording functionality
├── hooks/               # React hooks
├── utils/               # Utility functions
├── db/                  # Database schemas
└── App.tsx             # Main app component

src-tauri/
├── src/                # Rust backend code
├── Cargo.toml          # Rust dependencies  
└── tauri.conf.json     # Tauri configuration

Key Files:
├── package.json        # npm scripts and dependencies
├── vite.config.js      # Vite build configuration
├── tsconfig.json       # TypeScript configuration
└── README.md           # Comprehensive documentation
```

### Making Code Changes
1. **Always start development server first**: `npm run dev`
2. **Make changes** to React components in `src/`
3. **Test immediately** in browser at localhost:5173
4. **Build frequently** with `npm run build` to catch build issues early
5. **Focus on web functionality** - avoid desktop-specific features that require Tauri backend

### Dependency Management
```bash
# Add npm dependencies
npm install <package-name>

# Update Rust dependencies (in src-tauri/)
cd src-tauri && cargo update

# Clean everything and reinstall
npm run clean && npm run setup
```

## Troubleshooting

### Common Issues & Solutions

**"Command not found: tauri"**
```bash
# Install Tauri CLI globally or use npx
npm install -g @tauri-apps/cli
# OR use npx for commands
npx tauri dev
```

**Build fails with webkit/glib errors on Linux:**
- **Expected on Ubuntu 24.04** - webkit2gtk version incompatibility
- **Solution**: Focus on web development, document limitation
- **Do not attempt to downgrade** system webkit packages

**Development server won't start:**
```bash
# Check if port 5173 is in use
lsof -i :5173
# Kill existing process if needed
pkill -f vite
npm run dev
```

**npm install fails:**
```bash
# Clear npm cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Performance Notes
- **Web builds are extremely fast** (~1-2 seconds)
- **npm operations are quick** (~15-25 seconds)  
- **Tauri builds are very slow** (45+ minutes when they work)
- **Development server starts quickly** (~5 seconds)

## Quick Reference Commands

```bash
# Essential workflow
npm run setup          # Complete setup (25 seconds)
npm run dev            # Start development (always works)
npm run build          # Build web frontend (2 seconds)

# Maintenance  
npm run clean          # Clean build artifacts
npm run install-deps   # Reinstall all dependencies

# Platform launchers (for end users)
./launch-linux.sh      # Linux launcher script
./launch-macos.sh      # macOS launcher script  
./launch-windows.bat   # Windows launcher script
```

## Important Notes

- **NEVER CANCEL long-running builds** - Tauri builds legitimately take 45+ minutes
- **Always test changes via web interface** - it provides full functionality validation
- **Set generous timeouts** - 60+ minutes for desktop builds, 120+ seconds for dependency installs
- **Web development is the reliable path** - desktop builds have platform compatibility issues
- **Read existing documentation** - README.md, INSTALLATION.md contain detailed setup instructions
- **Focus on frontend changes** - backend Rust changes require working Tauri build system

## Code Style and Standards

### TypeScript/React Best Practices
- Use functional components with hooks instead of class components
- Follow React naming conventions (PascalCase for components, camelCase for functions)
- Use TypeScript strict mode - all components should have proper typing
- Prefer explicit return types for functions
- Use meaningful variable and function names

### Code Organization
- Place React components in `src/components/`
- Place custom hooks in `src/hooks/`
- Place utilities in `src/utils/`
- Place database schemas in `src/db/`
- Keep components small and focused on single responsibility

### Git Workflow
- Create feature branches from main: `git checkout -b feature/description`
- Use conventional commit messages: `feat:`, `fix:`, `docs:`, `refactor:`
- Test changes thoroughly before committing
- Keep commits focused and atomic

## Security Guidelines

- **Never commit secrets** - Use environment variables or secure configuration
- **Validate user inputs** - Always sanitize and validate data from users
- **Local processing priority** - Keep audio processing local when possible
- **Secure database operations** - Use parameterized queries, validate schemas
- **Review dependencies** - Be cautious when adding new dependencies