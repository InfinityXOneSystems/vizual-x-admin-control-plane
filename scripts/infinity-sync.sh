#!/bin/bash

###############################################################################
# INFINITY SYNC - Master Synchronization Script
# Ensures real-time synchronization across the entire Vizual-X ecosystem
# Components: Git, Docker, GCP, Cloudflare, Workspace
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
WATCH_MODE=false
WATCH_INTERVAL=60
LOG_FILE="/tmp/infinity-sync.log"

# Parse arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --watch) WATCH_MODE=true ;;
        --interval) WATCH_INTERVAL="$2"; shift ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Logging function
log() {
    local level=$1
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
    
    case $level in
        ERROR) echo -e "${RED}[ERROR]${NC} $message" ;;
        SUCCESS) echo -e "${GREEN}[SUCCESS]${NC} $message" ;;
        INFO) echo -e "${BLUE}[INFO]${NC} $message" ;;
        WARN) echo -e "${YELLOW}[WARN]${NC} $message" ;;
    esac
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

###############################################################################
# GIT SYNC
###############################################################################
sync_git() {
    log INFO "Starting Git sync..."
    echo "[GIT] ⟳ Checking repository status..."
    
    if ! command_exists git; then
        echo "[GIT] ✗ Git not installed"
        log ERROR "Git not installed"
        return 1
    fi
    
    if [ ! -d ".git" ]; then
        echo "[GIT] ✗ Not a git repository"
        log WARN "Not in a git repository"
        return 1
    fi
    
    # Fetch latest changes
    if git fetch origin >/dev/null 2>&1; then
        echo "[GIT] ⟳ Fetched latest changes from remote"
        log INFO "Git fetch successful"
    else
        echo "[GIT] ✗ Failed to fetch from remote"
        log ERROR "Git fetch failed"
        return 1
    fi
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD -- 2>/dev/null; then
        echo "[GIT] ⟳ Uncommitted changes detected, stashing..."
        git stash push -m "infinity-sync auto-stash $(date +%s)" >/dev/null 2>&1
        log INFO "Stashed uncommitted changes"
    fi
    
    # Get current branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "main")
    
    # Check if we're behind remote
    LOCAL=$(git rev-parse HEAD 2>/dev/null)
    REMOTE=$(git rev-parse origin/$CURRENT_BRANCH 2>/dev/null || echo "$LOCAL")
    
    if [ "$LOCAL" != "$REMOTE" ]; then
        echo "[GIT] ⟳ Pulling latest changes..."
        if git pull --rebase origin $CURRENT_BRANCH >/dev/null 2>&1; then
            echo "[GIT] ✓ Repository synchronized with remote"
            log SUCCESS "Git pull successful"
        else
            echo "[GIT] ✗ Failed to pull changes"
            log ERROR "Git pull failed"
            return 1
        fi
    else
        echo "[GIT] ✓ Repository up to date"
        log INFO "Git repository already up to date"
    fi
    
    return 0
}

###############################################################################
# DOCKER SYNC
###############################################################################
sync_docker() {
    log INFO "Starting Docker sync..."
    echo "[DOCKER] ⟳ Checking Docker status..."
    
    if ! command_exists docker; then
        echo "[DOCKER] ✗ Docker not installed"
        log WARN "Docker not installed"
        return 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info >/dev/null 2>&1; then
        echo "[DOCKER] ✗ Docker daemon not running"
        log ERROR "Docker daemon not accessible"
        return 1
    fi
    
    # Check if docker-compose.yml exists
    if [ -f "docker-compose.yml" ]; then
        echo "[DOCKER] ⟳ Checking container configurations..."
        
        # Get list of services from compose file
        if command_exists docker-compose; then
            SERVICES=$(docker-compose config --services 2>/dev/null || echo "")
            
            if [ -n "$SERVICES" ]; then
                echo "[DOCKER] ⟳ Verifying services: $SERVICES"
                
                # Check if containers are running and up to date
                if docker-compose ps --quiet 2>/dev/null | grep -q .; then
                    echo "[DOCKER] ✓ Containers are running"
                    log INFO "Docker containers running"
                else
                    echo "[DOCKER] ⟳ Starting containers..."
                    if docker-compose up -d >/dev/null 2>&1; then
                        echo "[DOCKER] ✓ Containers started successfully"
                        log SUCCESS "Docker containers started"
                    else
                        echo "[DOCKER] ✗ Failed to start containers"
                        log ERROR "Failed to start Docker containers"
                        return 1
                    fi
                fi
            else
                echo "[DOCKER] ✓ No services defined"
                log INFO "No Docker services configured"
            fi
        else
            echo "[DOCKER] ⟳ docker-compose not available, using docker compose"
            if docker compose ps >/dev/null 2>&1; then
                echo "[DOCKER] ✓ Services verified via docker compose"
                log INFO "Docker compose services verified"
            fi
        fi
    else
        echo "[DOCKER] ✓ No docker-compose.yml found"
        log INFO "No Docker compose configuration found"
    fi
    
    return 0
}

###############################################################################
# GCP SYNC
###############################################################################
sync_gcp() {
    log INFO "Starting GCP sync..."
    echo "[GCP] ⟳ Checking GCP status..."
    
    if ! command_exists gcloud; then
        echo "[GCP] ✗ gcloud CLI not installed"
        log WARN "gcloud CLI not installed"
        return 1
    fi
    
    # Check if authenticated
    if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>/dev/null | grep -q .; then
        echo "[GCP] ✗ Not authenticated with GCP"
        log WARN "GCP not authenticated"
        return 1
    fi
    
    # Get current project
    PROJECT=$(gcloud config get-value project 2>/dev/null || echo "")
    
    if [ -n "$PROJECT" ]; then
        echo "[GCP] ⟳ Active project: $PROJECT"
        log INFO "GCP project: $PROJECT"
        
        # Check Cloud Run services (if available)
        if gcloud run services list --format="value(name)" >/dev/null 2>&1; then
            SERVICE_COUNT=$(gcloud run services list --format="value(name)" 2>/dev/null | wc -l)
            echo "[GCP] ✓ Found $SERVICE_COUNT Cloud Run service(s)"
            log INFO "GCP Cloud Run services: $SERVICE_COUNT"
        fi
        
        echo "[GCP] ✓ GCP sync verified"
        log SUCCESS "GCP sync completed"
    else
        echo "[GCP] ✗ No active GCP project"
        log WARN "No active GCP project configured"
        return 1
    fi
    
    return 0
}

###############################################################################
# CLOUDFLARE SYNC
###############################################################################
sync_cloudflare() {
    log INFO "Starting Cloudflare sync..."
    echo "[CLOUDFLARE] ⟳ Checking Cloudflare tunnel status..."
    
    if ! command_exists cloudflared; then
        echo "[CLOUDFLARE] ✗ cloudflared not installed"
        log WARN "cloudflared not installed"
        return 1
    fi
    
    # Check if tunnel is running
    if pgrep -x "cloudflared" >/dev/null 2>&1; then
        echo "[CLOUDFLARE] ✓ Tunnel is running"
        log INFO "Cloudflare tunnel is active"
    else
        echo "[CLOUDFLARE] ✗ Tunnel not running"
        log WARN "Cloudflare tunnel not running"
        # Don't return error as tunnel might not be needed in all environments
    fi
    
    return 0
}

###############################################################################
# WORKSPACE SYNC
###############################################################################
sync_workspace() {
    log INFO "Starting Workspace sync..."
    echo "[WORKSPACE] ⟳ Checking Google Workspace connectivity..."
    
    # This is a placeholder for workspace-specific sync logic
    # In a real implementation, this would check Google Workspace API connectivity
    # For now, we just log that it's been checked
    
    echo "[WORKSPACE] ✓ Workspace check completed (placeholder)"
    log INFO "Google Workspace sync placeholder completed"
    
    return 0
}

###############################################################################
# MAIN SYNC LOOP
###############################################################################
run_sync() {
    local sync_start=$(date +%s)
    log INFO "================================"
    log INFO "Starting Infinity Sync cycle"
    log INFO "================================"
    
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║           INFINITY SYNC - Ecosystem Heartbeat             ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    
    local failed=0
    
    # Run all sync operations
    sync_git || ((failed++))
    echo ""
    
    sync_docker || ((failed++))
    echo ""
    
    sync_gcp || ((failed++))
    echo ""
    
    sync_cloudflare || ((failed++))
    echo ""
    
    sync_workspace || ((failed++))
    echo ""
    
    local sync_end=$(date +%s)
    local duration=$((sync_end - sync_start))
    
    echo "╔════════════════════════════════════════════════════════════╗"
    if [ $failed -eq 0 ]; then
        echo "║  ✓ Sync Complete - All Systems Operational               ║"
        log SUCCESS "Sync completed successfully in ${duration}s"
    else
        echo "║  ⚠ Sync Complete - $failed component(s) reported issues   ║"
        log WARN "Sync completed with $failed warning(s) in ${duration}s"
    fi
    echo "║  Duration: ${duration}s                                          ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    
    log INFO "Sync cycle completed"
    
    return 0
}

###############################################################################
# ENTRY POINT
###############################################################################
main() {
    # Initialize log file
    echo "=== Infinity Sync Started at $(date) ===" >> "$LOG_FILE"
    log INFO "Infinity Sync initialized"
    
    if [ "$WATCH_MODE" = true ]; then
        log INFO "Starting in watch mode (interval: ${WATCH_INTERVAL}s)"
        echo "🔄 Watch mode enabled - syncing every ${WATCH_INTERVAL} seconds"
        echo "Press Ctrl+C to stop"
        echo ""
        
        while true; do
            run_sync
            log INFO "Waiting ${WATCH_INTERVAL}s before next sync..."
            sleep $WATCH_INTERVAL
        done
    else
        run_sync
    fi
}

# Run main function
main
