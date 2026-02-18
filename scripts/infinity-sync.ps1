###############################################################################
# INFINITY SYNC - Master Synchronization Script (PowerShell)
# Ensures real-time synchronization across the entire Vizual-X ecosystem
# Components: Git, Docker, GCP, Cloudflare, Workspace
###############################################################################

param(
    [switch]$Watch,
    [int]$Interval = 60
)

$ErrorActionPreference = "Continue"
$LogFile = "$env:TEMP\infinity-sync.log"

# Color output functions
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Add-Content -Path $LogFile -Value "[$timestamp] [$Level] $Message"
    
    switch ($Level) {
        "ERROR" { Write-Host "[ERROR] $Message" -ForegroundColor Red }
        "SUCCESS" { Write-Host "[SUCCESS] $Message" -ForegroundColor Green }
        "INFO" { Write-Host "[INFO] $Message" -ForegroundColor Cyan }
        "WARN" { Write-Host "[WARN] $Message" -ForegroundColor Yellow }
    }
}

# Check if command exists
function Test-CommandExists {
    param([string]$Command)
    return $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

###############################################################################
# GIT SYNC
###############################################################################
function Sync-Git {
    Write-ColorOutput "Starting Git sync..." "INFO"
    Write-Host "[GIT] ⟳ Checking repository status..."
    
    if (-not (Test-CommandExists "git")) {
        Write-Host "[GIT] ✗ Git not installed"
        Write-ColorOutput "Git not installed" "ERROR"
        return $false
    }
    
    if (-not (Test-Path ".git")) {
        Write-Host "[GIT] ✗ Not a git repository"
        Write-ColorOutput "Not in a git repository" "WARN"
        return $false
    }
    
    try {
        # Fetch latest changes
        git fetch origin 2>$null | Out-Null
        Write-Host "[GIT] ⟳ Fetched latest changes from remote"
        Write-ColorOutput "Git fetch successful" "INFO"
        
        # Check for uncommitted changes
        $status = git status --porcelain 2>$null
        if ($status) {
            Write-Host "[GIT] ⟳ Uncommitted changes detected, stashing..."
            git stash push -m "infinity-sync auto-stash $(Get-Date -Format 'yyyyMMdd-HHmmss')" 2>$null | Out-Null
            Write-ColorOutput "Stashed uncommitted changes" "INFO"
        }
        
        # Get current branch
        $currentBranch = git rev-parse --abbrev-ref HEAD 2>$null
        if (-not $currentBranch) {
            $currentBranch = "main"
        }
        
        # Check if we're behind remote
        $local = git rev-parse HEAD 2>$null
        $remote = git rev-parse "origin/$currentBranch" 2>$null
        
        if ($local -ne $remote) {
            Write-Host "[GIT] ⟳ Pulling latest changes..."
            git pull --rebase origin $currentBranch 2>$null | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[GIT] ✓ Repository synchronized with remote"
                Write-ColorOutput "Git pull successful" "SUCCESS"
            } else {
                Write-Host "[GIT] ✗ Failed to pull changes"
                Write-ColorOutput "Git pull failed" "ERROR"
                return $false
            }
        } else {
            Write-Host "[GIT] ✓ Repository up to date"
            Write-ColorOutput "Git repository already up to date" "INFO"
        }
        
        return $true
    }
    catch {
        Write-Host "[GIT] ✗ Error during git sync: $_"
        Write-ColorOutput "Git sync error: $_" "ERROR"
        return $false
    }
}

###############################################################################
# DOCKER SYNC
###############################################################################
function Sync-Docker {
    Write-ColorOutput "Starting Docker sync..." "INFO"
    Write-Host "[DOCKER] ⟳ Checking Docker status..."
    
    if (-not (Test-CommandExists "docker")) {
        Write-Host "[DOCKER] ✗ Docker not installed"
        Write-ColorOutput "Docker not installed" "WARN"
        return $false
    }
    
    try {
        # Check if Docker daemon is running
        docker info 2>$null | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "[DOCKER] ✗ Docker daemon not running"
            Write-ColorOutput "Docker daemon not accessible" "ERROR"
            return $false
        }
        
        # Check if docker-compose.yml exists
        if (Test-Path "docker-compose.yml") {
            Write-Host "[DOCKER] ⟳ Checking container configurations..."
            
            if (Test-CommandExists "docker-compose") {
                $services = docker-compose config --services 2>$null
                
                if ($services) {
                    Write-Host "[DOCKER] ⟳ Verifying services: $($services -join ', ')"
                    
                    $running = docker-compose ps --quiet 2>$null
                    if ($running) {
                        Write-Host "[DOCKER] ✓ Containers are running"
                        Write-ColorOutput "Docker containers running" "INFO"
                    } else {
                        Write-Host "[DOCKER] ⟳ Starting containers..."
                        docker-compose up -d 2>$null | Out-Null
                        if ($LASTEXITCODE -eq 0) {
                            Write-Host "[DOCKER] ✓ Containers started successfully"
                            Write-ColorOutput "Docker containers started" "SUCCESS"
                        } else {
                            Write-Host "[DOCKER] ✗ Failed to start containers"
                            Write-ColorOutput "Failed to start Docker containers" "ERROR"
                            return $false
                        }
                    }
                } else {
                    Write-Host "[DOCKER] ✓ No services defined"
                    Write-ColorOutput "No Docker services configured" "INFO"
                }
            } else {
                Write-Host "[DOCKER] ⟳ docker-compose not available, using docker compose"
                docker compose ps 2>$null | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "[DOCKER] ✓ Services verified via docker compose"
                    Write-ColorOutput "Docker compose services verified" "INFO"
                }
            }
        } else {
            Write-Host "[DOCKER] ✓ No docker-compose.yml found"
            Write-ColorOutput "No Docker compose configuration found" "INFO"
        }
        
        return $true
    }
    catch {
        Write-Host "[DOCKER] ✗ Error during Docker sync: $_"
        Write-ColorOutput "Docker sync error: $_" "ERROR"
        return $false
    }
}

###############################################################################
# GCP SYNC
###############################################################################
function Sync-GCP {
    Write-ColorOutput "Starting GCP sync..." "INFO"
    Write-Host "[GCP] ⟳ Checking GCP status..."
    
    if (-not (Test-CommandExists "gcloud")) {
        Write-Host "[GCP] ✗ gcloud CLI not installed"
        Write-ColorOutput "gcloud CLI not installed" "WARN"
        return $false
    }
    
    try {
        # Check if authenticated
        $activeAccount = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>$null
        if (-not $activeAccount) {
            Write-Host "[GCP] ✗ Not authenticated with GCP"
            Write-ColorOutput "GCP not authenticated" "WARN"
            return $false
        }
        
        # Get current project
        $project = gcloud config get-value project 2>$null
        
        if ($project) {
            Write-Host "[GCP] ⟳ Active project: $project"
            Write-ColorOutput "GCP project: $project" "INFO"
            
            # Check Cloud Run services (if available)
            $services = gcloud run services list --format="value(name)" 2>$null
            if ($services) {
                $serviceCount = ($services | Measure-Object).Count
                Write-Host "[GCP] ✓ Found $serviceCount Cloud Run service(s)"
                Write-ColorOutput "GCP Cloud Run services: $serviceCount" "INFO"
            }
            
            Write-Host "[GCP] ✓ GCP sync verified"
            Write-ColorOutput "GCP sync completed" "SUCCESS"
        } else {
            Write-Host "[GCP] ✗ No active GCP project"
            Write-ColorOutput "No active GCP project configured" "WARN"
            return $false
        }
        
        return $true
    }
    catch {
        Write-Host "[GCP] ✗ Error during GCP sync: $_"
        Write-ColorOutput "GCP sync error: $_" "ERROR"
        return $false
    }
}

###############################################################################
# CLOUDFLARE SYNC
###############################################################################
function Sync-Cloudflare {
    Write-ColorOutput "Starting Cloudflare sync..." "INFO"
    Write-Host "[CLOUDFLARE] ⟳ Checking Cloudflare tunnel status..."
    
    if (-not (Test-CommandExists "cloudflared")) {
        Write-Host "[CLOUDFLARE] ✗ cloudflared not installed"
        Write-ColorOutput "cloudflared not installed" "WARN"
        return $false
    }
    
    try {
        # Check if tunnel is running
        $process = Get-Process cloudflared -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "[CLOUDFLARE] ✓ Tunnel is running"
            Write-ColorOutput "Cloudflare tunnel is active" "INFO"
        } else {
            Write-Host "[CLOUDFLARE] ✗ Tunnel not running"
            Write-ColorOutput "Cloudflare tunnel not running" "WARN"
        }
        
        return $true
    }
    catch {
        Write-Host "[CLOUDFLARE] ✗ Error during Cloudflare sync: $_"
        Write-ColorOutput "Cloudflare sync error: $_" "ERROR"
        return $false
    }
}

###############################################################################
# WORKSPACE SYNC
###############################################################################
function Sync-Workspace {
    Write-ColorOutput "Starting Workspace sync..." "INFO"
    Write-Host "[WORKSPACE] ⟳ Checking Google Workspace connectivity..."
    
    # This is a placeholder for workspace-specific sync logic
    # In a real implementation, this would check Google Workspace API connectivity
    
    Write-Host "[WORKSPACE] ✓ Workspace check completed (placeholder)"
    Write-ColorOutput "Google Workspace sync placeholder completed" "INFO"
    
    return $true
}

###############################################################################
# MAIN SYNC LOOP
###############################################################################
function Invoke-Sync {
    $syncStart = Get-Date
    Write-ColorOutput "================================" "INFO"
    Write-ColorOutput "Starting Infinity Sync cycle" "INFO"
    Write-ColorOutput "================================" "INFO"
    
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗"
    Write-Host "║           INFINITY SYNC - Ecosystem Heartbeat             ║"
    Write-Host "╚════════════════════════════════════════════════════════════╝"
    Write-Host ""
    
    $failed = 0
    
    # Run all sync operations
    if (-not (Sync-Git)) { $failed++ }
    Write-Host ""
    
    if (-not (Sync-Docker)) { $failed++ }
    Write-Host ""
    
    if (-not (Sync-GCP)) { $failed++ }
    Write-Host ""
    
    if (-not (Sync-Cloudflare)) { $failed++ }
    Write-Host ""
    
    if (-not (Sync-Workspace)) { $failed++ }
    Write-Host ""
    
    $syncEnd = Get-Date
    $duration = ($syncEnd - $syncStart).TotalSeconds
    
    Write-Host "╔════════════════════════════════════════════════════════════╗"
    if ($failed -eq 0) {
        Write-Host "║  ✓ Sync Complete - All Systems Operational               ║"
        Write-ColorOutput "Sync completed successfully in $([math]::Round($duration, 2))s" "SUCCESS"
    } else {
        Write-Host "║  ⚠ Sync Complete - $failed component(s) reported issues   ║"
        Write-ColorOutput "Sync completed with $failed warning(s) in $([math]::Round($duration, 2))s" "WARN"
    }
    Write-Host "║  Duration: $([math]::Round($duration, 2))s                                    ║"
    Write-Host "╚════════════════════════════════════════════════════════════╝"
    Write-Host ""
    
    Write-ColorOutput "Sync cycle completed" "INFO"
}

###############################################################################
# ENTRY POINT
###############################################################################
function Main {
    # Initialize log file
    Add-Content -Path $LogFile -Value "=== Infinity Sync Started at $(Get-Date) ==="
    Write-ColorOutput "Infinity Sync initialized" "INFO"
    
    if ($Watch) {
        Write-ColorOutput "Starting in watch mode (interval: ${Interval}s)" "INFO"
        Write-Host "🔄 Watch mode enabled - syncing every $Interval seconds"
        Write-Host "Press Ctrl+C to stop"
        Write-Host ""
        
        while ($true) {
            Invoke-Sync
            Write-ColorOutput "Waiting ${Interval}s before next sync..." "INFO"
            Start-Sleep -Seconds $Interval
        }
    } else {
        Invoke-Sync
    }
}

# Run main function
Main
