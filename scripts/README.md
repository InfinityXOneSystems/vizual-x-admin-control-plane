# Repository Management Scripts

This directory contains scripts to help manage and maintain your Vizual-X Admin Control Plane repository.

## Scripts Overview

### 1. analyze-local-repo.ps1 / analyze-local-repo.sh
**Purpose:** Comprehensive analysis of your local repository to identify issues preventing push to GitHub.

**Features:**
- Repository size analysis
- Large file detection (>10MB)
- Git status check
- Branch analysis
- Untracked files detection
- node_modules validation
- .gitignore analysis
- Remote connection test
- Unpushed commits check
- Monaco Editor files verification

**Usage (Windows PowerShell):**
```powershell
cd C:\AI\vizual-x-admin-control-plane
.\scripts\analyze-local-repo.ps1 -GenerateReport
```

**Usage (Linux/Mac Bash):**
```bash
cd ~/AI/vizual-x-admin-control-plane
./scripts/analyze-local-repo.sh --report
```

**Output:**
- Console output with colored status indicators
- Optional markdown report: `repo-analysis-report.md`

### 2. merge-local-repos.ps1
**Purpose:** Safely merge code from infinity-mesh into vizual-x-admin-control-plane.

**Features:**
- Pre-merge validation
- Source directory analysis
- File categorization
- Conflict detection
- Merge strategy recommendations
- Command generation

**Usage:**
```powershell
cd C:\AI\vizual-x-admin-control-plane
.\scripts\merge-local-repos.ps1 -SourcePath "C:\AI\infinity-mesh" -Verbose

# Dry run to see what would happen
.\scripts\merge-local-repos.ps1 -SourcePath "C:\AI\infinity-mesh" -DryRun
```

**Output:**
- Detailed merge analysis
- `merge-commands.txt` with step-by-step commands

## Common Issues & Solutions

### Issue 1: Repository too large to push
**Symptoms:**
- Git push fails with "remote: error: File ... is too large"
- Push hangs or times out

**Solution:**
1. Run `analyze-local-repo.ps1` to identify large files
2. Move large files to `.gitignore`
3. Use Git LFS for necessary large files:
   ```bash
   git lfs install
   git lfs track "*.zip"
   git add .gitattributes
   ```

### Issue 2: Essential files not tracked
**Symptoms:**
- `package.json`, `tsconfig.json` not in git
- Build fails on remote

**Solution:**
Update `.gitignore` to explicitly allow essential files:
```gitignore
# Allow essential config files
!package.json
!package-lock.json
!tsconfig.json
!manifest.json
!vite.config.ts
```

### Issue 3: node_modules tracked in git
**Symptoms:**
- Repository size is huge (>500MB)
- Slow git operations

**Solution:**
```bash
git rm -r --cached node_modules
git commit -m "Remove node_modules from tracking"
echo "node_modules" >> .gitignore
git add .gitignore
git commit -m "Add node_modules to .gitignore"
```

### Issue 4: Merge conflicts
**Symptoms:**
- Git merge fails
- Conflicting files

**Solution:**
Use the merge helper script which:
1. Creates a feature branch
2. Identifies conflicts
3. Provides merge strategy
4. Generates safe commands

## Best Practices

### Before Pushing to GitHub
1. ✅ Run `analyze-local-repo.ps1` to check for issues
2. ✅ Ensure repository size < 100MB (recommended)
3. ✅ Verify no large files (>10MB) are tracked
4. ✅ Check .gitignore is correctly configured
5. ✅ Commit all changes
6. ✅ Test build locally: `npm run build`

### Merging Code from Other Repos
1. ✅ Create a feature branch (never merge to main!)
2. ✅ Use `merge-local-repos.ps1` to analyze
3. ✅ Review conflicts manually
4. ✅ Test incrementally after each merge
5. ✅ Push to feature branch
6. ✅ Create Pull Request for review

### Daily Workflow
```bash
# Morning: sync with remote
git pull origin main

# During work: commit frequently
git add <files>
git commit -m "feat: description"

# Before push: analyze
./scripts/analyze-local-repo.sh

# Push to feature branch
git push origin feature/your-branch-name
```

## Monaco Editor Deployment

For deploying the Monaco Editor, see:
- `MONACO_DEPLOYMENT_BLUEPRINT.md` - Comprehensive deployment guide
- Follow the phase-by-phase integration steps

## Troubleshooting

### Script won't run (PowerShell)
```powershell
# Enable script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Script won't run (Bash)
```bash
# Make executable
chmod +x scripts/analyze-local-repo.sh
```

### Git commands fail
```bash
# Check git config
git config --list

# Set user if needed
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## Getting Help

If you encounter issues:
1. Run the analysis script first
2. Review the generated report
3. Check this README for common solutions
4. Review MONACO_DEPLOYMENT_BLUEPRINT.md for Monaco-specific issues

## Contributing

When adding new scripts:
1. Document purpose and usage
2. Add error handling
3. Provide both PowerShell and Bash versions
4. Update this README
