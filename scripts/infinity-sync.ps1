# ===================================================================
# VIZUAL-X ADMIN CONTROL PLANE - INFINITY SYNC (The God Script)
# ===================================================================
# Purpose: Master synchronization engine for Local, GitHub, GCP, and Cloudflare
# Usage: .\infinity-sync.ps1 [-DryRun] [-Verbose]
# ===================================================================

[CmdletBinding()]
param(
    [switch]$DryRun,
    [switch]$Verbose
)

$ErrorActionPreference = "Continue"
$WarningPreference = "Continue"

# Colors and formatting
$script:Colors = @{
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Info = "Cyan"
    Header = "Magenta"
}

function Write-Header {
    param([string]$Message)
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor $Colors.Header
    Write-Host "  $Message" -ForegroundColor $Colors.Header
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor $Colors.Header
    Write-Host ""
}

function Write-Section {
    param([string]$Message)
    Write-Host ""
    Write-Host "[$Message]" -ForegroundColor $Colors.Info
    Write-Host "───────────────────────────────────────────────────────────" -ForegroundColor $Colors.Info
}

function Write-Status {
    param(
        [string]$Message,
        [ValidateSet("Success", "Warning", "Error", "Info")]
        [string]$Type = "Info"
    )
    $symbol = switch ($Type) {
        "Success" { "✅" }
        "Warning" { "⚠️ " }
        "Error" { "❌" }
        "Info" { "ℹ️ " }
    }
    Write-Host "  $symbol $Message" -ForegroundColor $Colors.$Type
}

# ===================================================================
# SYNC STATUS TRACKING
# ===================================================================
$script:SyncStatus = @{
    GitSync = @{ Status = "Unknown"; Details = @() }
    DockerSync = @{ Status = "Unknown"; Details = @() }
    GCPSync = @{ Status = "Unknown"; Details = @() }
    CloudflareCheck = @{ Status = "Unknown"; Details = @() }
    AuthCheck = @{ Status = "Unknown"; Details = @() }
}

# ===================================================================
# 1. OAUTH/AUTH CHECK
# ===================================================================
function Test-Authentication {
    Write-Section "1/5: Authentication Check"
    
    $authStatus = @{
        GitHubCLI = $false
        GCloudCLI = $false
    }
    
    # Check GitHub CLI (gh)
    try {
        $ghAuth = gh auth status 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Status "GitHub CLI (gh) authenticated" -Type Success
            $authStatus.GitHubCLI = $true
        } else {
            Write-Status "GitHub CLI (gh) not authenticated. Run: gh auth login" -Type Warning
        }
    } catch {
        Write-Status "GitHub CLI (gh) not found. Install from: https://cli.github.com/" -Type Warning
    }
    
    # Check Google Cloud CLI (gcloud)
    try {
        $gcloudAuth = gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>&1
        if ($gcloudAuth -and $LASTEXITCODE -eq 0) {
            Write-Status "Google Cloud CLI (gcloud) authenticated as: $gcloudAuth" -Type Success
            $authStatus.GCloudCLI = $true
        } else {
            Write-Status "Google Cloud CLI (gcloud) not authenticated. Run: gcloud auth login" -Type Warning
        }
    } catch {
        Write-Status "Google Cloud CLI (gcloud) not found. Install from: https://cloud.google.com/sdk/docs/install" -Type Warning
    }
    
    $script:SyncStatus.AuthCheck.Status = if ($authStatus.GitHubCLI -and $authStatus.GCloudCLI) { "Success" } 
                                          elseif ($authStatus.GitHubCLI -or $authStatus.GCloudCLI) { "Partial" } 
                                          else { "Failed" }
    $script:SyncStatus.AuthCheck.Details = $authStatus
    
    return $authStatus
}

# ===================================================================
# 2. GIT SYNC
# ===================================================================
function Sync-GitRepository {
    Write-Section "2/5: Git Repository Sync"
    
    # Check if we're in a git repository
    if (-not (Test-Path ".git")) {
        Write-Status "Not a git repository" -Type Error
        $script:SyncStatus.GitSync.Status = "Failed"
        return
    }
    
    # Get current branch
    $currentBranch = git rev-parse --abbrev-ref HEAD 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Status "Failed to get current branch" -Type Error
        $script:SyncStatus.GitSync.Status = "Failed"
        return
    }
    
    Write-Status "Current branch: $currentBranch" -Type Info
    
    # Check for uncommitted changes
    $gitStatus = git status --porcelain 2>&1
    if ($gitStatus) {
        $changeCount = ($gitStatus | Measure-Object).Count
        Write-Status "Found $changeCount uncommitted change(s)" -Type Warning
        $script:SyncStatus.GitSync.Details += "Uncommitted: $changeCount files"
    } else {
        Write-Status "Working directory clean" -Type Success
    }
    
    # Fetch from remote
    Write-Status "Fetching from remote..." -Type Info
    if (-not $DryRun) {
        git fetch origin 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Status "Fetch completed" -Type Success
        } else {
            Write-Status "Fetch failed" -Type Error
            $script:SyncStatus.GitSync.Status = "Failed"
            return
        }
    }
    
    # Check for divergence
    $localCommit = git rev-parse HEAD 2>&1
    $remoteCommit = git rev-parse "origin/$currentBranch" 2>&1
    
    if ($localCommit -eq $remoteCommit) {
        Write-Status "Local and remote are in sync" -Type Success
        $script:SyncStatus.GitSync.Status = "Synced"
    } else {
        # Check if we're ahead or behind
        $aheadBehind = git rev-list --left-right --count "HEAD...origin/$currentBranch" 2>&1
        if ($aheadBehind -match '(\d+)\s+(\d+)') {
            $ahead = $matches[1]
            $behind = $matches[2]
            
            if ($ahead -gt 0 -and $behind -eq 0) {
                Write-Status "Local is $ahead commit(s) ahead of remote" -Type Warning
                $script:SyncStatus.GitSync.Details += "Ahead: $ahead commits"
                
                # Offer to push
                if (-not $DryRun) {
                    Write-Status "Consider pushing changes: git push origin $currentBranch" -Type Info
                }
            } elseif ($behind -gt 0 -and $ahead -eq 0) {
                Write-Status "Local is $behind commit(s) behind remote" -Type Warning
                $script:SyncStatus.GitSync.Details += "Behind: $behind commits"
                
                # Offer to pull/rebase
                if (-not $DryRun -and -not $gitStatus) {
                    Write-Status "Attempting to rebase..." -Type Info
                    git rebase "origin/$currentBranch" 2>&1 | Out-Null
                    if ($LASTEXITCODE -eq 0) {
                        Write-Status "Rebase successful" -Type Success
                    } else {
                        Write-Status "Rebase failed. Run manually: git rebase origin/$currentBranch" -Type Error
                    }
                }
            } else {
                Write-Status "Branch has diverged ($ahead ahead, $behind behind)" -Type Error
                $script:SyncStatus.GitSync.Details += "Diverged: $ahead ahead, $behind behind"
                Write-Status "Manual intervention required" -Type Error
            }
            
            $script:SyncStatus.GitSync.Status = "Diverged"
        }
    }
}

# ===================================================================
# 3. DOCKER SYNC
# ===================================================================
function Sync-DockerContainers {
    Write-Section "3/5: Docker Container Sync"
    
    # Check if Docker is running
    try {
        $dockerInfo = docker info 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Status "Docker is not running" -Type Error
            $script:SyncStatus.DockerSync.Status = "Failed"
            return
        }
        Write-Status "Docker daemon is running" -Type Success
    } catch {
        Write-Status "Docker not found. Install from: https://www.docker.com/" -Type Error
        $script:SyncStatus.DockerSync.Status = "Failed"
        return
    }
    
    # Check if docker-compose.yml exists
    if (-not (Test-Path "docker-compose.yml")) {
        Write-Status "docker-compose.yml not found" -Type Warning
        $script:SyncStatus.DockerSync.Status = "NoManifest"
        return
    }
    
    # Get running containers
    $runningContainers = docker-compose ps --services --filter "status=running" 2>&1
    $definedServices = docker-compose config --services 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Status "Failed to read docker-compose configuration" -Type Error
        $script:SyncStatus.DockerSync.Status = "Failed"
        return
    }
    
    $definedServicesList = $definedServices -split "`n" | Where-Object { $_ -ne "" }
    $runningContainersList = if ($runningContainers) { $runningContainers -split "`n" | Where-Object { $_ -ne "" } } else { @() }
    
    Write-Status "Defined services: $($definedServicesList.Count)" -Type Info
    Write-Status "Running services: $($runningContainersList.Count)" -Type Info
    
    # Check if all defined services are running
    $notRunning = $definedServicesList | Where-Object { $_ -notin $runningContainersList }
    
    if ($notRunning) {
        Write-Status "Services not running: $($notRunning -join ', ')" -Type Warning
        $script:SyncStatus.DockerSync.Details += "Not running: $($notRunning -join ', ')"
        
        if (-not $DryRun) {
            $response = Read-Host "Do you want to start missing services? (y/n)"
            if ($response -eq 'y') {
                Write-Status "Starting services..." -Type Info
                docker-compose up -d 2>&1 | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Write-Status "Services started successfully" -Type Success
                    $script:SyncStatus.DockerSync.Status = "Synced"
                } else {
                    Write-Status "Failed to start services" -Type Error
                    $script:SyncStatus.DockerSync.Status = "Failed"
                }
            }
        } else {
            Write-Status "Dry run mode: Would start services" -Type Info
        }
        $script:SyncStatus.DockerSync.Status = "OutOfSync"
    } else {
        Write-Status "All services are running" -Type Success
        $script:SyncStatus.DockerSync.Status = "Synced"
    }
}

# ===================================================================
# 4. GCP SYNC
# ===================================================================
function Sync-GoogleCloudPlatform {
    Write-Section "4/5: Google Cloud Platform Sync"
    
    # Check if gcloud is available
    try {
        $gcloudVersion = gcloud version --format="value(version)" 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Status "gcloud CLI not available" -Type Error
            $script:SyncStatus.GCPSync.Status = "Failed"
            return
        }
    } catch {
        Write-Status "gcloud CLI not found" -Type Error
        $script:SyncStatus.GCPSync.Status = "Failed"
        return
    }
    
    # Get current project
    $currentProject = gcloud config get-value project 2>&1
    if (-not $currentProject -or $currentProject -eq "(unset)") {
        Write-Status "No GCP project configured. Run: gcloud config set project PROJECT_ID" -Type Warning
        $script:SyncStatus.GCPSync.Status = "NotConfigured"
        return
    }
    
    Write-Status "Current GCP project: $currentProject" -Type Info
    
    # Check Cloud Run service status
    $serviceName = "vizual-x-admin-control-plane"
    Write-Status "Checking Cloud Run service: $serviceName" -Type Info
    
    try {
        $serviceInfo = gcloud run services describe $serviceName --region=us-central1 --format="value(status.url)" 2>&1
        if ($LASTEXITCODE -eq 0 -and $serviceInfo) {
            Write-Status "Cloud Run service is deployed at: $serviceInfo" -Type Success
            $script:SyncStatus.GCPSync.Details += "Service URL: $serviceInfo"
            
            # Get latest revision
            $latestRevision = gcloud run services describe $serviceName --region=us-central1 --format="value(status.latestReadyRevisionName)" 2>&1
            Write-Status "Latest revision: $latestRevision" -Type Info
            
            # Check if local version is newer (simplified check - compares git commit)
            if (Test-Path ".git") {
                $localCommit = git rev-parse --short HEAD 2>&1
                Write-Status "Local commit: $localCommit" -Type Info
                
                if (-not $DryRun) {
                    $response = Read-Host "Deploy current version to Cloud Run? (y/n)"
                    if ($response -eq 'y') {
                        Write-Status "To deploy, run: gcloud run deploy $serviceName --source=. --region=us-central1" -Type Info
                    }
                }
            }
            
            $script:SyncStatus.GCPSync.Status = "Synced"
        } else {
            Write-Status "Cloud Run service not found or not deployed" -Type Warning
            $script:SyncStatus.GCPSync.Status = "NotDeployed"
        }
    } catch {
        Write-Status "Failed to check Cloud Run service status" -Type Error
        $script:SyncStatus.GCPSync.Status = "Failed"
    }
}

# ===================================================================
# 5. CLOUDFLARE CHECK
# ===================================================================
function Test-CloudflareReachability {
    Write-Section "5/5: Cloudflare Reachability Check"
    
    $domain = "vizual-x.com"
    
    try {
        Write-Status "Testing DNS resolution for $domain..." -Type Info
        $dnsResult = Resolve-DnsName $domain -ErrorAction Stop
        if ($dnsResult) {
            Write-Status "DNS resolution successful" -Type Success
            $script:SyncStatus.CloudflareCheck.Details += "DNS resolved"
            
            # Show IP addresses
            $addresses = $dnsResult | Where-Object { $_.Type -eq 'A' } | Select-Object -ExpandProperty IPAddress
            if ($addresses) {
                Write-Status "IP addresses: $($addresses -join ', ')" -Type Info
                $script:SyncStatus.CloudflareCheck.Details += "IPs: $($addresses -join ', ')"
            }
        }
    } catch {
        Write-Status "DNS resolution failed for $domain" -Type Warning
        $script:SyncStatus.CloudflareCheck.Details += "DNS failed"
    }
    
    # Test HTTP/HTTPS connectivity
    try {
        Write-Status "Testing HTTPS connectivity to https://$domain..." -Type Info
        $response = Invoke-WebRequest -Uri "https://$domain" -Method Head -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Status "HTTPS connectivity successful (Status: $($response.StatusCode))" -Type Success
            $script:SyncStatus.CloudflareCheck.Status = "Reachable"
        } else {
            Write-Status "HTTPS returned status: $($response.StatusCode)" -Type Warning
            $script:SyncStatus.CloudflareCheck.Status = "PartiallyReachable"
        }
    } catch {
        Write-Status "HTTPS connectivity test failed: $($_.Exception.Message)" -Type Warning
        $script:SyncStatus.CloudflareCheck.Status = "Unreachable"
    }
}

# ===================================================================
# MAIN EXECUTION
# ===================================================================
function Start-InfinitySync {
    Write-Header "INFINITY SYNC v1.0 - The God Script"
    
    if ($DryRun) {
        Write-Status "DRY RUN MODE - No changes will be made" -Type Warning
    }
    
    # Run all sync checks
    $authStatus = Test-Authentication
    Sync-GitRepository
    Sync-DockerContainers
    Sync-GoogleCloudPlatform
    Test-CloudflareReachability
    
    # Display summary
    Write-Header "SYNC STATUS SUMMARY"
    
    Write-Host "Authentication:     " -NoNewline
    Write-Host $script:SyncStatus.AuthCheck.Status -ForegroundColor $(if ($script:SyncStatus.AuthCheck.Status -eq "Success") { $Colors.Success } else { $Colors.Warning })
    
    Write-Host "Git Repository:     " -NoNewline
    Write-Host $script:SyncStatus.GitSync.Status -ForegroundColor $(if ($script:SyncStatus.GitSync.Status -eq "Synced") { $Colors.Success } else { $Colors.Warning })
    
    Write-Host "Docker Containers:  " -NoNewline
    Write-Host $script:SyncStatus.DockerSync.Status -ForegroundColor $(if ($script:SyncStatus.DockerSync.Status -eq "Synced") { $Colors.Success } else { $Colors.Warning })
    
    Write-Host "GCP Cloud Run:      " -NoNewline
    Write-Host $script:SyncStatus.GCPSync.Status -ForegroundColor $(if ($script:SyncStatus.GCPSync.Status -eq "Synced") { $Colors.Success } else { $Colors.Warning })
    
    Write-Host "Cloudflare:         " -NoNewline
    Write-Host $script:SyncStatus.CloudflareCheck.Status -ForegroundColor $(if ($script:SyncStatus.CloudflareCheck.Status -eq "Reachable") { $Colors.Success } else { $Colors.Warning })
    
    Write-Host ""
    Write-Status "Infinity Sync completed at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -Type Info
    Write-Host ""
    
    # Save sync status to JSON for backend consumption
    $statusFile = Join-Path $PSScriptRoot "../readiness/infinity-sync-status.json"
    $statusDir = Split-Path $statusFile -Parent
    if (-not (Test-Path $statusDir)) {
        New-Item -ItemType Directory -Path $statusDir -Force | Out-Null
    }
    
    $syncReport = @{
        timestamp = (Get-Date).ToString("o")
        status = $script:SyncStatus
        dryRun = $DryRun.IsPresent
    }
    
    $syncReport | ConvertTo-Json -Depth 10 | Set-Content -Path $statusFile -Encoding UTF8
    Write-Status "Status saved to: $statusFile" -Type Info
}

# Execute main function
Start-InfinitySync
