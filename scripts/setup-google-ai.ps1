#!/usr/bin/env pwsh
# VIZUAL-X Google AI Studio Setup Script
# Validates configuration and prepares the environment

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  VIZUAL-X GOOGLE AI STUDIO SETUP" -ForegroundColor White
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (Test-Path .env) {
    Write-Host "[✓] .env file found" -ForegroundColor Green
} else {
    if (Test-Path .env.example) {
        Write-Host "[!] Creating .env from .env.example..." -ForegroundColor Yellow
        Copy-Item .env.example .env
        Write-Host "[✓] .env file created" -ForegroundColor Green
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
        Write-Host "  ACTION REQUIRED: Configure your API key" -ForegroundColor Yellow
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. Get your Google AI API key from:" -ForegroundColor White
        Write-Host "   https://aistudio.google.com/app/apikey" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "2. Edit .env file and replace 'your-api-key-here' with your actual key" -ForegroundColor White
        Write-Host ""
        Write-Host "3. Run this script again to validate" -ForegroundColor White
        Write-Host ""
        exit 0
    } else {
        Write-Host "[✗] .env.example not found!" -ForegroundColor Red
        Write-Host "   Please ensure you're in the project root directory" -ForegroundColor Yellow
        exit 1
    }
}

# Read .env file
$envContent = Get-Content .env -Raw
$apiKey = if ($envContent -match 'VITE_GOOGLE_AI_API_KEY=(.+)') { $matches[1].Trim() } else { "" }

# Validate API key format
if ($apiKey -eq "" -or $apiKey -eq "your-api-key-here") {
    Write-Host "[✗] API key not configured" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please set your Google AI API key in .env file" -ForegroundColor Yellow
    Write-Host "Get your key from: https://aistudio.google.com/app/apikey" -ForegroundColor Cyan
    Write-Host ""
    exit 1
} else {
    Write-Host "[✓] API key found in .env" -ForegroundColor Green
}

# Check if API key format is valid (basic check)
if ($apiKey.Length -lt 20) {
    Write-Host "[!] API key seems too short, please verify" -ForegroundColor Yellow
} else {
    Write-Host "[✓] API key format looks valid" -ForegroundColor Green
}

# Check Node.js installation
Write-Host ""
Write-Host "Checking dependencies..." -ForegroundColor White
try {
    $nodeVersion = node --version
    Write-Host "[✓] Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[✗] Node.js not found!" -ForegroundColor Red
    Write-Host "   Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "[✓] npm installed: v$npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[✗] npm not found!" -ForegroundColor Red
    exit 1
}

# Check if dependencies are installed
if (Test-Path node_modules) {
    Write-Host "[✓] node_modules found" -ForegroundColor Green
} else {
    Write-Host "[!] node_modules not found, running npm install..." -ForegroundColor Yellow
    npm install
    Write-Host "[✓] Dependencies installed" -ForegroundColor Green
}

# Check required packages
$packageJson = Get-Content package.json -Raw | ConvertFrom-Json
$requiredPackages = @(
    "@google/generative-ai",
    "react-router-dom"
)

Write-Host ""
Write-Host "Checking required packages..." -ForegroundColor White
foreach ($package in $requiredPackages) {
    if ($packageJson.dependencies.$package) {
        Write-Host "[✓] $package installed" -ForegroundColor Green
    } else {
        Write-Host "[✗] $package missing" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SETUP COMPLETE!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Start the development server: npm run dev" -ForegroundColor Cyan
Write-Host "2. Open http://localhost:5173 in your browser" -ForegroundColor Cyan
Write-Host "3. Login with demo credentials from the login page" -ForegroundColor Cyan
Write-Host ""
Write-Host "Documentation: docs/GOOGLE_AI_SETUP.md" -ForegroundColor Yellow
Write-Host ""
