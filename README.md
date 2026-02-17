<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Vizual-X Admin Control Plane

This repository contains the Vizual-X Admin Control Plane with Monaco Editor integration and comprehensive repository management tools.

View your app in AI Studio: https://ai.studio/apps/drive/1oiktXBWh0yMNn1NxXLcFb_oT6O92CNJ0

## 🚀 Quick Start

**NEW: Repository was recently fixed! See [HOW_TO_USE.txt](HOW_TO_USE.txt) for complete instructions.**

### Prerequisites
- Node.js (v20+)
- Git

### Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in `.env.local` to your Gemini API key

3. Run the app:
   ```bash
   npm run dev
   ```

4. Open browser to: http://localhost:5173

## 📚 Documentation

- **[HOW_TO_USE.txt](HOW_TO_USE.txt)** - Visual step-by-step guide (START HERE!)
- **[QUICK_START.md](QUICK_START.md)** - Quick reference for immediate action
- **[REPOSITORY_RECOVERY_GUIDE.md](REPOSITORY_RECOVERY_GUIDE.md)** - Comprehensive recovery guide
- **[SUMMARY.md](SUMMARY.md)** - Complete overview of recent fixes
- **[MONACO_DEPLOYMENT_BLUEPRINT.md](MONACO_DEPLOYMENT_BLUEPRINT.md)** - Monaco Editor deployment guide

## 🛠️ Repository Management Tools

This repository includes comprehensive analysis and merge tools in the `scripts/` directory:

### Analyze Your Repository
```powershell
# Windows
.\scripts\analyze-local-repo.ps1 -GenerateReport

# Linux/Mac
./scripts/analyze-local-repo.sh --report
```

### Merge Code Safely
```powershell
.\scripts\merge-local-repos.ps1 -SourcePath "C:\AI\other-repo" -Verbose
```

See [scripts/README.md](scripts/README.md) for detailed documentation.

## ✅ Recent Fixes (February 2026)

- ✅ Fixed critical .gitignore issues (was blocking essential .json/.txt files)
- ✅ Added comprehensive repository analysis scripts
- ✅ Added safe repository merge helper
- ✅ Fixed TypeScript errors
- ✅ Updated GitHub Actions CI workflow
- ✅ Added Git LFS support
- ✅ Build and typecheck validated

See [SUMMARY.md](SUMMARY.md) for complete details.

## 🏗️ Project Structure

```
/
├── components/          # React components including Monaco Editor
├── services/            # Backend services
├── scripts/             # Repository management scripts
├── vscode-extension-kit/ # VS Code extension for Monaco Editor
├── backend/             # Python backend services
├── infra/               # Infrastructure as code
└── docs/                # Documentation
```

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run typecheck` - Run TypeScript type checking
- `npm test` - Run tests

## 🔒 Security

This repository uses:
- Git LFS for large files
- Proper .gitignore configuration
- Regular security scanning via GitHub Actions

## 🤝 Contributing

1. Create a feature branch (never commit to main!)
2. Make your changes
3. Run analysis: `.\scripts\analyze-local-repo.ps1`
4. Test locally: `npm run build && npm run typecheck`
5. Push to feature branch
6. Create Pull Request

## 📞 Getting Help

- Review [HOW_TO_USE.txt](HOW_TO_USE.txt) for step-by-step guidance
- Check [scripts/README.md](scripts/README.md) for troubleshooting
- See [QUICK_START.md](QUICK_START.md) for common solutions

---

**Last Updated:** February 17, 2026  
**Status:** ✅ Repository Fixed & Validated
