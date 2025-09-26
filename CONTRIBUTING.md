# Contributing to Dwight AI Audio DVR

Thank you for your interest in contributing to Dwight AI Audio DVR! This document provides guidelines for contributing to the project.

## 🚀 Quick Start for Contributors

### Prerequisites
Before you begin, ensure you have:
- Node.js v18+ 
- Rust and Cargo (for desktop builds)
- Git for version control

### Setting Up Development Environment
```bash
# Clone the repository
git clone https://github.com/KellyTheCreator/D.Y.H.T-d-y-ht-.git
cd D.Y.H.T-d-y-ht-

# Install dependencies (takes ~15 seconds)
npm install

# Start development server (always works)
npm run dev
```

**Important**: Always use the web development workflow (`npm run dev`) for development as it's the most reliable across platforms.

## 🛠️ Development Workflow

### 1. Web-First Development
- Use `npm run dev` to start the development server at http://localhost:5173/
- Make changes to React components in `src/`
- Test immediately in browser - changes are hot-reloaded
- Use browser developer tools for debugging

### 2. Testing Your Changes
- **Manual Testing**: Always test in the web interface
- **Build Testing**: Run `npm run build` to verify production build works
- **Functionality Testing**: Test all affected features through the UI
- **Cross-browser Testing**: Test in different browsers if making UI changes

### 3. Code Style Guidelines

#### TypeScript/React
- Use functional components with hooks
- Follow TypeScript strict mode
- Use meaningful, descriptive names
- Keep components focused and small
- Document complex logic with comments

#### File Organization
```
src/
├── components/     # React components
├── hooks/          # Custom React hooks  
├── utils/          # Utility functions
├── db/             # Database schemas
└── types/          # TypeScript type definitions
```

#### Naming Conventions
- Components: `PascalCase` (e.g., `DwightAudioDashboard.tsx`)
- Functions: `camelCase` (e.g., `chatWithDwight`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_MODEL`)
- Files: `kebab-case` or `PascalCase` for components

## 📝 Commit Guidelines

### Commit Message Format
Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

#### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

#### Examples
```bash
feat(chat): add voice input support to Dwight chat
fix(audio): resolve waveform visualization lag
docs(readme): update installation instructions
refactor(components): simplify audio recording logic
```

## 🔀 Pull Request Process

### 1. Branch Creation
```bash
# Create a feature branch from main
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Making Changes
- Keep changes focused and atomic
- Test thoroughly in web development mode
- Ensure build processes work (`npm run build`)
- Update documentation if needed

### 3. Before Submitting PR
- [ ] Code follows project style guidelines
- [ ] Changes tested in web development mode
- [ ] Build completes successfully
- [ ] No console errors in development
- [ ] Documentation updated (if applicable)
- [ ] Commit messages follow conventional format

### 4. PR Requirements
- Clear description of changes
- Link to related issues
- Screenshots for UI changes
- Test results and validation steps

## 🧪 Testing Strategy

Since the repository doesn't have formal test frameworks configured, we rely on:

### Manual Testing
- **Web Interface**: Test all functionality at http://localhost:5173/
- **Build Verification**: Ensure `npm run build` completes
- **Cross-Platform**: Test on different operating systems when possible
- **Browser Testing**: Verify compatibility across browsers

### Testing Checklist
- [ ] Audio dashboard loads correctly
- [ ] Dwight AI chat interface works
- [ ] Waveform visualization displays
- [ ] Audio controls are responsive
- [ ] AI model status indicators show correctly
- [ ] No console errors or warnings

## 🚫 What Not to Do

### Platform Limitations
- **Don't try to fix webkit2gtk issues** on Ubuntu 24.04 - these are known platform limitations
- **Don't force desktop builds** if they fail - web development is the primary workflow
- **Don't break web functionality** while attempting desktop fixes

### Code Quality
- Don't commit without testing in web development mode
- Don't add unnecessary dependencies
- Don't commit secrets or sensitive information
- Don't break existing functionality

## 🔒 Security Considerations

### Privacy First
- All audio processing should remain local
- No cloud dependencies unless explicitly opt-in
- Validate all user inputs
- Use secure database operations

### Code Security
- Never commit API keys, tokens, or secrets
- Validate and sanitize user inputs
- Follow secure coding practices
- Review dependencies for security issues

## 🆘 Getting Help

### Documentation
- Check [README.md](README.md) for project overview
- Review [INSTALLATION.md](INSTALLATION.md) for setup details
- See [AI_MODELS.md](AI_MODELS.md) for AI integration info

### Community Support
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Ask questions and share ideas
- **Pull Requests**: Contribute code changes

### Common Issues
1. **Build fails**: Focus on web development (`npm run dev`)
2. **Dependencies issues**: Try `npm run clean && npm install`
3. **Desktop app fails**: Use web interface for development

## 🎯 Contribution Areas

### High-Impact Areas
- **Frontend UI/UX**: React components and user interface
- **Audio Processing**: Web Audio API integration
- **AI Integration**: Model management and chat interface
- **Documentation**: Guides, tutorials, and API docs

### Technical Skills Needed
- **Frontend**: React, TypeScript, HTML5, CSS3
- **Audio**: Web Audio API, audio processing
- **AI/ML**: Integration with language models
- **Database**: SQLite, SQL queries
- **Build Tools**: Vite, npm scripts

## 📊 Code Review Process

### For Contributors
- Ensure PR template is completely filled out
- Respond promptly to review feedback
- Keep PRs focused and reasonably sized
- Be open to suggestions and improvements

### Review Criteria
- Code quality and style consistency
- Functionality and testing validation
- Documentation updates
- Security and privacy considerations
- Performance impact

---

**Thank you for contributing to Dwight AI Audio DVR!** 🦇

Your contributions help make this privacy-first audio assistant better for everyone. If you have questions about contributing, feel free to open a GitHub issue or start a discussion.