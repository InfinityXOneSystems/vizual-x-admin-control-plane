# ===================================================================
# VIZUAL-X REPOSITORY MERGE & REFACTOR HELPER
# ===================================================================
# Purpose: Safely merge local code changes and prepare for push
# Location: Run from C:\AI\vizual-x-admin-control-plane
# ===================================================================

param(
    [string]$SourcePath = "C:\AI\infinity-mesh",
    [string]$TargetPath = "C:\AI\vizual-x-admin-control-plane",
    [switch]$DryRun,
    [switch]$Verbose
)

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "    VIZUAL-X MERGE & REFACTOR HELPER v1.0" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
    Write-Host ""
}

# Change to target repository
Set-Location $TargetPath

# ===================================================================
# STEP 1: PRE-MERGE VALIDATION
# ===================================================================
Write-Host "[Step 1/6] Pre-merge validation..." -ForegroundColor Yellow

# Check if git repo
if (-not (Test-Path ".git")) {
    Write-Host "  ❌ ERROR: Not a git repository!" -ForegroundColor Red
    exit 1
}

# Check for uncommitted changes
$uncommitted = git status --porcelain
if ($uncommitted) {
    Write-Host "  ⚠️  WARNING: You have uncommitted changes!" -ForegroundColor Red
    Write-Host "  Please commit or stash changes before merging." -ForegroundColor Red
    
    $response = Read-Host "  Continue anyway? (yes/no)"
    if ($response -ne "yes") {
        exit 1
    }
}

Write-Host "  ✅ Pre-validation complete" -ForegroundColor Green

# ===================================================================
# STEP 2: ANALYZE SOURCE DIRECTORY
# ===================================================================
Write-Host "[Step 2/6] Analyzing source directory..." -ForegroundColor Yellow

if (-not (Test-Path $SourcePath)) {
    Write-Host "  ❌ ERROR: Source path not found: $SourcePath" -ForegroundColor Red
    exit 1
}

$sourceFiles = Get-ChildItem -Path $SourcePath -Recurse -File | 
    Where-Object { 
        $_.FullName -notmatch "node_modules" -and 
        $_.FullName -notmatch "\.git" -and
        $_.FullName -notmatch "dist" -and
        $_.Extension -match "\.(ts|tsx|js|jsx|json|md|yml|yaml)$"
    }

Write-Host "  📁 Found $($sourceFiles.Count) source files to review" -ForegroundColor Cyan

# ===================================================================
# STEP 3: FILE CATEGORIZATION
# ===================================================================
Write-Host "[Step 3/6] Categorizing files..." -ForegroundColor Yellow

$categories = @{
    "Components" = @()
    "Services" = @()
    "Backend" = @()
    "Config" = @()
    "Docs" = @()
    "Other" = @()
}

foreach ($file in $sourceFiles) {
    $relativePath = $file.FullName.Replace("$SourcePath\", "")
    
    if ($relativePath -match "component") {
        $categories["Components"] += $file
    }
    elseif ($relativePath -match "service|api|backend") {
        $categories["Services"] += $file
    }
    elseif ($relativePath -match "server|backend|api") {
        $categories["Backend"] += $file
    }
    elseif ($relativePath -match "\.(json|yml|yaml|config)$") {
        $categories["Config"] += $file
    }
    elseif ($relativePath -match "\.(md|txt)$") {
        $categories["Docs"] += $file
    }
    else {
        $categories["Other"] += $file
    }
}

Write-Host ""
foreach ($category in $categories.Keys) {
    $count = $categories[$category].Count
    if ($count -gt 0) {
        Write-Host "  📋 ${category}: $count files" -ForegroundColor Cyan
    }
}

# ===================================================================
# STEP 4: CONFLICT DETECTION
# ===================================================================
Write-Host ""
Write-Host "[Step 4/6] Detecting potential conflicts..." -ForegroundColor Yellow

$conflicts = @()

foreach ($file in $sourceFiles) {
    $relativePath = $file.FullName.Replace("$SourcePath\", "")
    $targetFile = Join-Path $TargetPath $relativePath
    
    if (Test-Path $targetFile) {
        $sourceHash = (Get-FileHash $file.FullName).Hash
        $targetHash = (Get-FileHash $targetFile).Hash
        
        if ($sourceHash -ne $targetHash) {
            $conflicts += @{
                Path = $relativePath
                SourceFile = $file.FullName
                TargetFile = $targetFile
            }
        }
    }
}

if ($conflicts.Count -gt 0) {
    Write-Host "  ⚠️  Found $($conflicts.Count) potential conflicts:" -ForegroundColor Yellow
    foreach ($conflict in $conflicts) {
        Write-Host "    - $($conflict.Path)" -ForegroundColor Magenta
    }
} else {
    Write-Host "  ✅ No conflicts detected" -ForegroundColor Green
}

# ===================================================================
# STEP 5: MERGE STRATEGY RECOMMENDATION
# ===================================================================
Write-Host ""
Write-Host "[Step 5/6] Generating merge strategy..." -ForegroundColor Yellow

$strategy = @"

RECOMMENDED MERGE STRATEGY
═══════════════════════════════════════════════════════════

1. CREATE A NEW FEATURE BRANCH
   git checkout -b feature/infinity-mesh-integration
   
2. SELECTIVELY COPY FILES (avoid overwriting working code)
   - Copy new components that don't exist in target
   - Merge configuration files carefully (package.json, tsconfig.json)
   - Update documentation to reflect new features
   
3. FOR CONFLICTING FILES:
   - Review differences with: git diff <file>
   - Use a merge tool like VS Code to manually merge
   - Prefer target version unless source has clear improvements
   
4. INCREMENTAL TESTING
   - Test after each major file addition
   - Run: npm install, npm run build, npm run typecheck
   - Fix any TypeScript errors immediately
   
5. COMMIT FREQUENTLY
   git add <files>
   git commit -m "Integrate: <feature>"
   
6. PUSH TO REMOTE BRANCH (not main!)
   git push origin feature/infinity-mesh-integration
   
7. CREATE PULL REQUEST for review

CRITICAL: DO NOT MERGE DIRECTLY TO MAIN!

═══════════════════════════════════════════════════════════
"@

Write-Host $strategy -ForegroundColor White

# ===================================================================
# STEP 6: GENERATE MERGE COMMANDS
# ===================================================================
Write-Host "[Step 6/6] Generating merge commands..." -ForegroundColor Yellow

$commandsFile = "merge-commands.txt"
$commands = @()

$commands += "# VIZUAL-X MERGE COMMANDS"
$commands += "# Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$commands += ""
$commands += "# Step 1: Create feature branch"
$commands += "git checkout -b feature/infinity-mesh-integration"
$commands += ""
$commands += "# Step 2: Copy new files (review each carefully)"

foreach ($file in $sourceFiles) {
    $relativePath = $file.FullName.Replace("$SourcePath\", "")
    $targetFile = Join-Path $TargetPath $relativePath
    
    if (-not (Test-Path $targetFile)) {
        $targetDir = Split-Path $targetFile -Parent
        $commands += "mkdir -p `"$targetDir`""
        $commands += "cp `"$($file.FullName)`" `"$targetFile`""
        $commands += ""
    }
}

$commands += "# Step 3: Stage and commit"
$commands += "git add ."
$commands += "git status"
$commands += "git commit -m 'feat: Integrate infinity mesh components'"
$commands += ""
$commands += "# Step 4: Build and test"
$commands += "npm install"
$commands += "npm run typecheck"
$commands += "npm run build"
$commands += ""
$commands += "# Step 5: Push to remote"
$commands += "git push origin feature/infinity-mesh-integration"

$commands | Out-File -FilePath $commandsFile -Encoding UTF8

Write-Host "  📄 Commands saved to: $commandsFile" -ForegroundColor Cyan

# ===================================================================
# SUMMARY
# ===================================================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "    MERGE ANALYSIS COMPLETE" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Yellow
Write-Host "  - Source files: $($sourceFiles.Count)" -ForegroundColor Cyan
Write-Host "  - Potential conflicts: $($conflicts.Count)" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review the merge strategy above" -ForegroundColor White
Write-Host "  2. Review merge-commands.txt for specific commands" -ForegroundColor White
Write-Host "  3. Execute merge incrementally with testing" -ForegroundColor White
Write-Host "  4. Create PR instead of pushing to main" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  IMPORTANT: Always use feature branches, never merge directly to main!" -ForegroundColor Red
Write-Host ""
