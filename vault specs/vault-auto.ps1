# ============================================================
# NEXT-GEN-AI | VAULT AUTO-RECOVERY (REPL-SAFE, CEILING)
# ============================================================

$ErrorActionPreference = "Stop"

function OK($m){ Write-Host "[OK] $m" -ForegroundColor Cyan }
function FAIL($m){ Write-Host "[FAIL] $m" -ForegroundColor Red; exit 1 }

# Ensure address
if (-not $env:VAULT_ADDR) {
  $env:VAULT_ADDR = "http://127.0.0.1:8200"
  OK "VAULT_ADDR set"
}

# Reachability
vault status | Out-Null

# Seal check
$status = vault status

if ($status -match "Sealed\s+true") {

  if (-not $env:VAULT_UNSEAL_KEY) {
    FAIL "Vault sealed and VAULT_UNSEAL_KEY not set"
  }

  vault operator unseal $env:VAULT_UNSEAL_KEY | Out-Null
  OK "Vault unsealed"

} else {
  OK "Vault already unsealed"
}

# Auth check
try {
  vault token lookup | Out-Null
  OK "Vault authenticated"
}
catch {
  if (-not $env:VAULT_ROOT_TOKEN) {
    FAIL "VAULT_ROOT_TOKEN not set"
  }
  vault login $env:VAULT_ROOT_TOKEN | Out-Null
  OK "Vault authenticated"
}

vault status | Out-Null
OK "Vault READY and AVAILABLE"
