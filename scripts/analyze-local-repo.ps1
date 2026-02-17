# ===================================================================
# VIZUAL-X ADMIN CONTROL PLANE - LOCAL REPOSITORY ANALYZER
# ===================================================================
# Purpose: Comprehensive analysis of local repository state,
#          identifying issues preventing GitHub push and merge
# Location: Run from C:\AI\vizual-x-admin-control-plane
# ===================================================================

param(
    [string]$RepoPath = "C:\AI\vizual-x-admin-control-plane",
    [switch]$Verbose,
    [switch]$GenerateReport,
    [string]$ReportPath = ".\repo-analysis-report.md"
)

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "    VIZUAL-X REPOSITORY ANALYZER v1.0" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Change to repository directory
Set-Location $RepoPath

# Initialize report
$report = @()
$report += "# Vizual-X Repository Analysis Report"
$report += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$report += ""

# ===================================================================
# 1. REPOSITORY SIZE ANALYSIS
# ===================================================================
Write-Host "[1/10] Analyzing repository size..." -ForegroundColor Yellow

$repoSize = (Get-ChildItem -Recurse -Force | Measure-Object -Property Length -Sum).Sum / 1MB
$report += "## 1. Repository Size"
$report += "**Total Size:** $([math]::Round($repoSize, 2)) MB"
$report += ""

if ($repoSize -gt 100) {
    Write-Host "  ⚠️  WARNING: Repository size exceeds 100 MB!" -ForegroundColor Red
    $report += "⚠️ **WARNING:** Repository exceeds recommended size (100 MB). Consider using Git LFS for large files."
    $report += ""
}

# ===================================================================
# 2. LARGE FILES DETECTION (>10MB)
# ===================================================================
Write-Host "[2/10] Detecting large files (>10MB)..." -ForegroundColor Yellow

$largeFiles = Get-ChildItem -Recurse -Force -File | 
    Where-Object { $_.Length -gt 10MB } | 
    Sort-Object Length -Descending |
    Select-Object FullName, @{Name="SizeMB";Expression={[math]::Round($_.Length/1MB, 2)}}

$report += "## 2. Large Files (>10MB)"
if ($largeFiles.Count -gt 0) {
    Write-Host "  🔍 Found $($largeFiles.Count) large file(s):" -ForegroundColor Red
    $report += "**Found:** $($largeFiles.Count) file(s)"
    $report += "| File | Size (MB) |"
    $report += "|------|-----------|"
    foreach ($file in $largeFiles) {
        $relativePath = $file.FullName.Replace("$RepoPath\", "")
        Write-Host "    - $relativePath ($($file.SizeMB) MB)" -ForegroundColor Magenta
        $report += "| $relativePath | $($file.SizeMB) |"
    }
} else {
    Write-Host "  ✅ No large files found" -ForegroundColor Green
    $report += "✅ No large files detected"
}
$report += ""

# ===================================================================
# 3. GIT STATUS CHECK
# ===================================================================
Write-Host "[3/10] Checking Git status..." -ForegroundColor Yellow

$gitStatus = git status --porcelain 2>&1
$report += "## 3. Git Status"
if ($gitStatus) {
    $uncommitted = ($gitStatus | Measure-Object).Count
    Write-Host "  ⚠️  Found $uncommitted uncommitted changes" -ForegroundColor Red
    $report += "**Uncommitted changes:** $uncommitted"
    $report += '```'
    $report += $gitStatus
    $report += '```'
} else {
    Write-Host "  ✅ Working directory clean" -ForegroundColor Green
    $report += "✅ Working directory is clean"
}
$report += ""

# ===================================================================
# 4. BRANCH ANALYSIS
# ===================================================================
Write-Host "[4/10] Analyzing branches..." -ForegroundColor Yellow

$currentBranch = git rev-parse --abbrev-ref HEAD
$branches = git branch -a

$report += "## 4. Branch Analysis"
$report += "**Current branch:** $currentBranch"
$report += ""
$report += "**All branches:**"
$report += '```'
$report += $branches
$report += '```'
$report += ""

Write-Host "  Current branch: $currentBranch" -ForegroundColor Cyan

# ===================================================================
# 5. UNTRACKED FILES
# ===================================================================
Write-Host "[5/10] Detecting untracked files..." -ForegroundColor Yellow

$untrackedFiles = git ls-files --others --exclude-standard
$report += "## 5. Untracked Files"
if ($untrackedFiles) {
    $untrackedCount = ($untrackedFiles | Measure-Object).Count
    Write-Host "  🔍 Found $untrackedCount untracked file(s)" -ForegroundColor Yellow
    $report += "**Count:** $untrackedCount"
    $report += '```'
    $report += $untrackedFiles
    $report += '```'
} else {
    Write-Host "  ✅ No untracked files" -ForegroundColor Green
    $report += "✅ No untracked files"
}
$report += ""

# ===================================================================
# 6. NODE_MODULES CHECK
# ===================================================================
Write-Host "[6/10] Checking for node_modules in git..." -ForegroundColor Yellow

$nodeModulesInGit = git ls-files | Select-String "node_modules"
$report += "## 6. Dependencies Check"
if ($nodeModulesInGit) {
    Write-Host "  ⚠️  WARNING: node_modules found in git tracking!" -ForegroundColor Red
    $report += "⚠️ **WARNING:** node_modules are being tracked by git (should be in .gitignore)"
    $report += '```'
    $report += $nodeModulesInGit
    $report += '```'
} else {
    Write-Host "  ✅ node_modules properly ignored" -ForegroundColor Green
    $report += "✅ node_modules properly excluded from git"
}
$report += ""

# ===================================================================
# 7. .GITIGNORE ANALYSIS
# ===================================================================
Write-Host "[7/10] Analyzing .gitignore..." -ForegroundColor Yellow

$report += "## 7. .gitignore Analysis"
if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore"
    $report += "**File exists:** ✅"
    $report += "**Lines:** $($gitignoreContent.Count)"
    
    # Check for problematic patterns
    $problematicPatterns = @("*.json", "*.txt")
    $foundProblematic = @()
    
    foreach ($pattern in $problematicPatterns) {
        if ($gitignoreContent -contains $pattern) {
            $foundProblematic += $pattern
        }
    }
    
    if ($foundProblematic.Count -gt 0) {
        Write-Host "  ⚠️  WARNING: Overly broad ignore patterns found!" -ForegroundColor Red
        $report += ""
        $report += "⚠️ **CRITICAL:** Overly broad patterns detected (may ignore essential files):"
        foreach ($pattern in $foundProblematic) {
            $report += "- `$pattern`"
        }
        $report += ""
        $report += "**Recommendation:** Update .gitignore to explicitly allow:"
        $report += "- `!package.json`"
        $report += "- `!tsconfig.json`"
        $report += "- `!manifest.json`"
        $report += "- Important .txt files in docs/"
    }
} else {
    Write-Host "  ⚠️  WARNING: No .gitignore file found!" -ForegroundColor Red
    $report += "⚠️ **WARNING:** No .gitignore file found"
}
$report += ""

# ===================================================================
# 8. REMOTE REPOSITORY CONNECTION
# ===================================================================
Write-Host "[8/10] Checking remote repository..." -ForegroundColor Yellow

$remotes = git remote -v
$report += "## 8. Remote Repository"
$report += '```'
$report += $remotes
$report += '```'
$report += ""

try {
    $remoteBranches = git ls-remote --heads origin 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Remote connection successful" -ForegroundColor Green
        $report += "✅ Remote connection verified"
    } else {
        Write-Host "  ⚠️  Cannot connect to remote" -ForegroundColor Red
        $report += "⚠️ Cannot verify remote connection"
    }
} catch {
    Write-Host "  ⚠️  Error checking remote: $_" -ForegroundColor Red
    $report += "⚠️ Error checking remote connection"
}
$report += ""

# ===================================================================
# 9. UNPUSHED COMMITS
# ===================================================================
Write-Host "[9/10] Checking for unpushed commits..." -ForegroundColor Yellow

$unpushedCommits = git log origin/$currentBranch..$currentBranch --oneline 2>&1
$report += "## 9. Unpushed Commits"
if ($LASTEXITCODE -eq 0 -and $unpushedCommits) {
    $commitCount = ($unpushedCommits | Measure-Object).Count
    Write-Host "  🔍 Found $commitCount unpushed commit(s)" -ForegroundColor Yellow
    $report += "**Count:** $commitCount"
    $report += '```'
    $report += $unpushedCommits
    $report += '```'
} else {
    Write-Host "  ✅ All commits pushed or branch not tracking remote" -ForegroundColor Green
    $report += "✅ No unpushed commits or branch not tracking remote"
}
$report += ""

# ===================================================================
# 10. MONACO EDITOR CHECK
# ===================================================================
Write-Host "[10/10] Checking Monaco Editor files..." -ForegroundColor Yellow

$monacoFiles = @(
    "components\MonacoEditor.tsx",
    "vscode-extension-kit\src\providers\MonacoEditorProvider.ts",
    "MONACO_DEPLOYMENT_BLUEPRINT.md"
)

$report += "## 10. Monaco Editor Files"
$report += "| File | Status |"
$report += "|------|--------|"

foreach ($file in $monacoFiles) {
    $exists = Test-Path $file
    if ($exists) {
        Write-Host "  ✅ $file" -ForegroundColor Green
        $report += "| $file | ✅ Exists |"
    } else {
        Write-Host "  ❌ $file (missing)" -ForegroundColor Red
        $report += "| $file | ❌ Missing |"
    }
}
$report += ""

# ===================================================================
# SUMMARY & RECOMMENDATIONS
# ===================================================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "    ANALYSIS COMPLETE - RECOMMENDATIONS" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$report += "## Summary & Recommendations"
$report += ""

# Build recommendations
$recommendations = @()

if ($repoSize -gt 100) {
    $recommendations += "1. **Repository Size:** Consider using Git LFS for large files"
}

if ($largeFiles.Count -gt 0) {
    $recommendations += "2. **Large Files:** Remove or track with Git LFS:"
    foreach ($file in $largeFiles) {
        $relativePath = $file.FullName.Replace("$RepoPath\", "")
        $recommendations += "   - `$relativePath`"
    }
}

if ($gitStatus) {
    $recommendations += "3. **Uncommitted Changes:** Commit or stash changes before pushing"
}

if ($nodeModulesInGit) {
    $recommendations += "4. **node_modules:** Remove from git tracking with:"
    $recommendations += "   ```bash"
    $recommendations += "   git rm -r --cached node_modules"
    $recommendations += "   git commit -m 'Remove node_modules from tracking'"
    $recommendations += "   ```"
}

$gitignoreContent = Get-Content ".gitignore" -ErrorAction SilentlyContinue
if ($gitignoreContent -contains "*.json" -or $gitignoreContent -contains "*.txt") {
    $recommendations += "5. **Fix .gitignore:** Update to allow essential config files:"
    $recommendations += "   ```"
    $recommendations += "   # Remove overly broad patterns: *.json, *.txt"
    $recommendations += "   # Add explicit allows:"
    $recommendations += "   !package.json"
    $recommendations += "   !tsconfig.json"
    $recommendations += "   !manifest.json"
    $recommendations += "   ```"
}

if ($recommendations.Count -eq 0) {
    $recommendations += "✅ No critical issues found! Repository appears ready to push."
}

foreach ($rec in $recommendations) {
    Write-Host $rec
    $report += $rec
}

$report += ""
$report += "---"
$report += "*Generated by Vizual-X Repository Analyzer*"

# ===================================================================
# SAVE REPORT
# ===================================================================
if ($GenerateReport) {
    $report | Out-File -FilePath $ReportPath -Encoding UTF8
    Write-Host ""
    Write-Host "📄 Report saved to: $ReportPath" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "For next steps, see: MONACO_DEPLOYMENT_BLUEPRINT.md" -ForegroundColor Yellow
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
