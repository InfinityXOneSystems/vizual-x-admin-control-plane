# ===================================================================
# VIZUAL-X ADMIN CONTROL PLANE - LOCAL SYSTEM AUDIT
# ===================================================================
# Purpose: Comprehensive forensic audit of local development environment
# Author: Vizual-X Autonomous Platform
# Usage: .\audit-local-system.ps1 [-Verbose]
# ===================================================================

param(
    [switch]$Verbose
)

# Initialize timestamp for output directory
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$outputDir = "readiness\local_audit_$timestamp"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "    VIZUAL-X LOCAL SYSTEM FORENSIC AUDIT v1.0" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Output Directory: $outputDir" -ForegroundColor Yellow
Write-Host ""

# Create output directory
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null

# ===================================================================
# 1. DOCKER STATUS AUDIT
# ===================================================================
Write-Host "[1/5] Auditing Docker status..." -ForegroundColor Yellow

$dockerReport = @()
$dockerReport += "# Docker Status Audit"
$dockerReport += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$dockerReport += ""

# Check if Docker is installed and running
try {
    $dockerVersion = docker version --format '{{.Server.Version}}' 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dockerReport += "## Docker Version"
        $dockerReport += "**Status:** ✅ Running"
        $dockerReport += "**Version:** $dockerVersion"
        $dockerReport += ""
        
        # List Docker images
        $dockerReport += "## Docker Images"
        $dockerImages = docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedSince}}" 2>&1
        if ($LASTEXITCODE -eq 0) {
            $dockerReport += '```'
            $dockerReport += $dockerImages
            $dockerReport += '```'
            $dockerReport += ""
            Write-Host "  ✅ Docker images captured" -ForegroundColor Green
        }
        
        # List Docker containers (all)
        $dockerReport += "## Docker Containers"
        $dockerReport += "### Running Containers"
        $runningContainers = docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" 2>&1
        $dockerReport += '```'
        $dockerReport += $runningContainers
        $dockerReport += '```'
        $dockerReport += ""
        
        $dockerReport += "### All Containers (including stopped)"
        $allContainers = docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.CreatedAt}}" 2>&1
        $dockerReport += '```'
        $dockerReport += $allContainers
        $dockerReport += '```'
        $dockerReport += ""
        Write-Host "  ✅ Docker containers captured" -ForegroundColor Green
        
        # Docker system info
        $dockerReport += "## Docker System Info"
        $dockerInfo = docker system df 2>&1
        $dockerReport += '```'
        $dockerReport += $dockerInfo
        $dockerReport += '```'
        $dockerReport += ""
    } else {
        $dockerReport += "⚠️ **Docker is not running or not installed**"
        $dockerReport += ""
        Write-Host "  ⚠️  Docker not available" -ForegroundColor Red
    }
} catch {
    $dockerReport += "⚠️ **Error checking Docker:** $_"
    $dockerReport += ""
    Write-Host "  ⚠️  Error checking Docker: $_" -ForegroundColor Red
}

$dockerReport | Out-File -FilePath "$outputDir\docker-status.md" -Encoding UTF8

# ===================================================================
# 2. OLLAMA STATUS AUDIT
# ===================================================================
Write-Host "[2/5] Auditing Ollama status..." -ForegroundColor Yellow

$ollamaReport = @()
$ollamaReport += "# Ollama Status Audit"
$ollamaReport += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$ollamaReport += ""

try {
    $ollamaVersion = ollama --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $ollamaReport += "## Ollama Version"
        $ollamaReport += "**Status:** ✅ Installed"
        $ollamaReport += '```'
        $ollamaReport += $ollamaVersion
        $ollamaReport += '```'
        $ollamaReport += ""
        
        # List Ollama models
        $ollamaReport += "## Installed Models"
        $ollamaModels = ollama list 2>&1
        if ($LASTEXITCODE -eq 0) {
            $ollamaReport += '```'
            $ollamaReport += $ollamaModels
            $ollamaReport += '```'
            $ollamaReport += ""
            Write-Host "  ✅ Ollama models captured" -ForegroundColor Green
        } else {
            $ollamaReport += "⚠️ **Could not list models** (Ollama service may not be running)"
            $ollamaReport += ""
            Write-Host "  ⚠️  Could not list Ollama models" -ForegroundColor Yellow
        }
        
        # Check if Ollama is running
        $ollamaReport += "## Service Status"
        try {
            $ollamaPs = ollama ps 2>&1
            if ($LASTEXITCODE -eq 0) {
                $ollamaReport += "**Status:** ✅ Running"
                $ollamaReport += '```'
                $ollamaReport += $ollamaPs
                $ollamaReport += '```'
                $ollamaReport += ""
            } else {
                $ollamaReport += "**Status:** ⚠️ Service not responding"
                $ollamaReport += ""
            }
        } catch {
            $ollamaReport += "**Status:** ⚠️ Could not check service status"
            $ollamaReport += ""
        }
    } else {
        $ollamaReport += "⚠️ **Ollama is not installed**"
        $ollamaReport += ""
        Write-Host "  ⚠️  Ollama not available" -ForegroundColor Red
    }
} catch {
    $ollamaReport += "⚠️ **Error checking Ollama:** $_"
    $ollamaReport += ""
    Write-Host "  ⚠️  Error checking Ollama: $_" -ForegroundColor Red
}

$ollamaReport | Out-File -FilePath "$outputDir\ollama-status.md" -Encoding UTF8

# ===================================================================
# 3. GIT CONFIGURATION AUDIT
# ===================================================================
Write-Host "[3/5] Auditing Git configuration..." -ForegroundColor Yellow

$gitReport = @()
$gitReport += "# Git Configuration Audit"
$gitReport += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$gitReport += ""

try {
    # Git version
    $gitVersion = git --version 2>&1
    $gitReport += "## Git Version"
    $gitReport += '```'
    $gitReport += $gitVersion
    $gitReport += '```'
    $gitReport += ""
    
    # Global configuration
    $gitReport += "## Global Configuration"
    $gitConfig = git config --global --list 2>&1
    $gitReport += '```'
    $gitReport += $gitConfig
    $gitReport += '```'
    $gitReport += ""
    
    # User identity
    $gitReport += "## User Identity"
    $gitUser = git config --global user.name 2>&1
    $gitEmail = git config --global user.email 2>&1
    $gitReport += "**Name:** $gitUser"
    $gitReport += "**Email:** $gitEmail"
    $gitReport += ""
    
    # SSH keys
    $gitReport += "## SSH Configuration"
    $sshDir = "$env:USERPROFILE\.ssh"
    if (Test-Path $sshDir) {
        $sshKeys = Get-ChildItem $sshDir -Filter "*.pub" -ErrorAction SilentlyContinue
        if ($sshKeys) {
            $gitReport += "**SSH Keys Found:**"
            foreach ($key in $sshKeys) {
                $gitReport += "- $($key.Name)"
            }
            $gitReport += ""
        } else {
            $gitReport += "⚠️ No SSH public keys found"
            $gitReport += ""
        }
    } else {
        $gitReport += "⚠️ SSH directory not found"
        $gitReport += ""
    }
    
    Write-Host "  ✅ Git configuration captured" -ForegroundColor Green
} catch {
    $gitReport += "⚠️ **Error checking Git:** $_"
    $gitReport += ""
    Write-Host "  ⚠️  Error checking Git: $_" -ForegroundColor Red
}

$gitReport | Out-File -FilePath "$outputDir\git-config.md" -Encoding UTF8

# ===================================================================
# 4. AI ENVIRONMENT VARIABLES AUDIT
# ===================================================================
Write-Host "[4/5] Auditing AI environment variables..." -ForegroundColor Yellow

$envReport = @()
$envReport += "# AI Environment Variables Audit"
$envReport += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$envReport += ""

# Define AI-related environment variable prefixes
$aiPrefixes = @(
    "OLLAMA",
    "OPENAI",
    "ANTHROPIC",
    "GOOGLE",
    "GITHUB",
    "GEMINI",
    "CLAUDE"
)

$envReport += "## Detected AI Environment Variables"
$envReport += ""

$foundVars = @()
foreach ($prefix in $aiPrefixes) {
    $matchingVars = Get-ChildItem Env: | Where-Object { $_.Name -like "$prefix*" }
    if ($matchingVars) {
        foreach ($var in $matchingVars) {
            $foundVars += $var
            # Sanitize sensitive values (show only first/last 4 chars if longer than 16)
            $displayValue = $var.Value
            if ($var.Value.Length -gt 16) {
                $displayValue = $var.Value.Substring(0, 4) + "..." + $var.Value.Substring($var.Value.Length - 4)
            }
            $envReport += "- **$($var.Name):** ``$displayValue``"
        }
    }
}

if ($foundVars.Count -eq 0) {
    $envReport += "⚠️ No AI-related environment variables found"
    Write-Host "  ⚠️  No AI environment variables found" -ForegroundColor Yellow
} else {
    $envReport += ""
    $envReport += "**Total Variables Found:** $($foundVars.Count)"
    Write-Host "  ✅ Found $($foundVars.Count) AI environment variables" -ForegroundColor Green
}

$envReport += ""
$envReport += "## Environment Variable Categories"
$envReport += ""
$envReport += "| Category | Count |"
$envReport += "|----------|-------|"

foreach ($prefix in $aiPrefixes) {
    $count = ($foundVars | Where-Object { $_.Name -like "$prefix*" }).Count
    if ($count -gt 0) {
        $envReport += "| $prefix | $count |"
    }
}

$envReport | Out-File -FilePath "$outputDir\ai-environment-variables.md" -Encoding UTF8

# ===================================================================
# 5. SYSTEM SUMMARY
# ===================================================================
Write-Host "[5/5] Generating system summary..." -ForegroundColor Yellow

$summaryReport = @()
$summaryReport += "# Vizual-X Local System Audit Summary"
$summaryReport += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
$summaryReport += ""

$summaryReport += "## Audit Overview"
$summaryReport += ""
$summaryReport += "This forensic audit captured the complete state of the local development environment."
$summaryReport += ""

$summaryReport += "## Files Generated"
$summaryReport += ""
$summaryReport += "1. `docker-status.md` - Docker images, containers, and system info"
$summaryReport += "2. `ollama-status.md` - Ollama installation and model inventory"
$summaryReport += "3. `git-config.md` - Git configuration and SSH keys"
$summaryReport += "4. `ai-environment-variables.md` - AI service credentials and configuration"
$summaryReport += "5. `summary.md` - This file"
$summaryReport += ""

$summaryReport += "## Quick Status"
$summaryReport += ""

# Docker status
try {
    docker version --format '{{.Server.Version}}' 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $summaryReport += "- **Docker:** ✅ Running"
    } else {
        $summaryReport += "- **Docker:** ⚠️ Not available"
    }
} catch {
    $summaryReport += "- **Docker:** ⚠️ Not available"
}

# Ollama status
try {
    ollama --version 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $summaryReport += "- **Ollama:** ✅ Installed"
    } else {
        $summaryReport += "- **Ollama:** ⚠️ Not installed"
    }
} catch {
    $summaryReport += "- **Ollama:** ⚠️ Not installed"
}

# Git status
try {
    git --version 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $summaryReport += "- **Git:** ✅ Configured"
    } else {
        $summaryReport += "- **Git:** ⚠️ Not available"
    }
} catch {
    $summaryReport += "- **Git:** ⚠️ Not available"
}

# AI Environment Variables
$aiVarCount = 0
foreach ($prefix in $aiPrefixes) {
    $aiVarCount += (Get-ChildItem Env: | Where-Object { $_.Name -like "$prefix*" }).Count
}
$summaryReport += "- **AI Environment Variables:** $aiVarCount found"

$summaryReport += ""
$summaryReport += "## Next Steps"
$summaryReport += ""
$summaryReport += "1. Review each audit report for completeness"
$summaryReport += "2. Compare with GCP inventory (run `gcp-inventory-scan.sh`)"
$summaryReport += "3. Compare with GitHub audit (check `.github/workflows/github-forensic-audit.yml`)"
$summaryReport += "4. Consolidate findings using the `00_SYSTEM_CONSOLIDATION_PLAN.md` guide"
$summaryReport += ""
$summaryReport += "---"
$summaryReport += "*Generated by Vizual-X Forensic Toolkit*"

$summaryReport | Out-File -FilePath "$outputDir\summary.md" -Encoding UTF8

# ===================================================================
# COMPLETION
# ===================================================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "    AUDIT COMPLETE" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Audit reports saved to: $outputDir" -ForegroundColor Yellow
Write-Host ""
Write-Host "Generated files:" -ForegroundColor Cyan
Write-Host "  - docker-status.md" -ForegroundColor White
Write-Host "  - ollama-status.md" -ForegroundColor White
Write-Host "  - git-config.md" -ForegroundColor White
Write-Host "  - ai-environment-variables.md" -ForegroundColor White
Write-Host "  - summary.md" -ForegroundColor White
Write-Host ""
Write-Host "Review the summary.md file for next steps." -ForegroundColor Yellow
Write-Host ""
