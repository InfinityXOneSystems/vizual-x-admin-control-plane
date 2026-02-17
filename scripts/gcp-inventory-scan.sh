#!/bin/bash

# ===================================================================
# VIZUAL-X ADMIN CONTROL PLANE - GCP INVENTORY SCAN
# ===================================================================
# Purpose: Comprehensive forensic inventory of Google Cloud resources
# Author: Vizual-X Autonomous Platform
# Usage: ./gcp-inventory-scan.sh <PROJECT_ID>
# Requirements: gcloud CLI must be installed and authenticated
# ===================================================================

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check for PROJECT_ID argument
if [ -z "$1" ]; then
    echo -e "${RED}Error: PROJECT_ID is required${NC}"
    echo "Usage: $0 <PROJECT_ID>"
    echo "Example: $0 my-gcp-project-id"
    exit 1
fi

PROJECT_ID="$1"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
OUTPUT_DIR="readiness/gcp_inventory_${TIMESTAMP}"

echo "═══════════════════════════════════════════════════════════"
echo "    VIZUAL-X GCP FORENSIC INVENTORY v1.0"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo -e "${YELLOW}Project ID: ${PROJECT_ID}${NC}"
echo -e "${YELLOW}Output Directory: ${OUTPUT_DIR}${NC}"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    echo "Please install gcloud: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Verify authentication
echo -e "${YELLOW}[0/7] Verifying gcloud authentication...${NC}"
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo -e "${RED}Error: Not authenticated with gcloud${NC}"
    echo "Please run: gcloud auth login"
    exit 1
fi

# Set the project
gcloud config set project "$PROJECT_ID" --quiet

echo -e "${GREEN}✅ Authentication verified${NC}"
echo ""

# ===================================================================
# 1. CLOUD RUN SERVICES
# ===================================================================
echo -e "${YELLOW}[1/7] Scanning Cloud Run services...${NC}"

cat > "$OUTPUT_DIR/cloudrun-services.md" << EOF
# Cloud Run Services Inventory
Generated: $(date '+%Y-%m-%d %H:%M:%S')
Project: ${PROJECT_ID}

## Services

EOF

if gcloud run services list --format="table(name,region,url,lastModifier)" &> /dev/null; then
    {
        echo '```'
        gcloud run services list --format="table(name,region,url,lastModifier)" 2>&1
        echo '```'
        echo ""
        
        # Get detailed info for each service
        echo "## Detailed Service Information"
        echo ""
        
        services=$(gcloud run services list --format="value(name,region)" 2>&1 | grep -v "Listed 0 items" || true)
        if [ -n "$services" ]; then
            while IFS=$'\t' read -r name region; do
                if [ -n "$name" ] && [ -n "$region" ]; then
                    echo "### Service: $name (Region: $region)"
                    echo '```'
                    gcloud run services describe "$name" --region="$region" --format="yaml" 2>&1 || echo "Failed to describe service"
                    echo '```'
                    echo ""
                fi
            done <<< "$services"
        else
            echo "No Cloud Run services found."
            echo ""
        fi
    } >> "$OUTPUT_DIR/cloudrun-services.md"
    echo -e "${GREEN}  ✅ Cloud Run services captured${NC}"
else
    echo "⚠️ **Could not access Cloud Run services** (API may not be enabled)" >> "$OUTPUT_DIR/cloudrun-services.md"
    echo -e "${YELLOW}  ⚠️  Could not access Cloud Run services${NC}"
fi

# ===================================================================
# 2. CLOUD FUNCTIONS
# ===================================================================
echo -e "${YELLOW}[2/7] Scanning Cloud Functions...${NC}"

cat > "$OUTPUT_DIR/cloud-functions.md" << EOF
# Cloud Functions Inventory
Generated: $(date '+%Y-%m-%d %H:%M:%S')
Project: ${PROJECT_ID}

## Functions (Gen 1)

EOF

if gcloud functions list --format="table(name,status,trigger,runtime)" &> /dev/null; then
    {
        echo '```'
        gcloud functions list --format="table(name,status,trigger,runtime)" 2>&1
        echo '```'
        echo ""
    } >> "$OUTPUT_DIR/cloud-functions.md"
    echo -e "${GREEN}  ✅ Cloud Functions (Gen 1) captured${NC}"
else
    echo "⚠️ **Could not access Cloud Functions** (API may not be enabled)" >> "$OUTPUT_DIR/cloud-functions.md"
    echo -e "${YELLOW}  ⚠️  Could not access Cloud Functions${NC}"
fi

# Check for Gen 2 functions
echo "" >> "$OUTPUT_DIR/cloud-functions.md"
echo "## Functions (Gen 2)" >> "$OUTPUT_DIR/cloud-functions.md"
echo "" >> "$OUTPUT_DIR/cloud-functions.md"

if gcloud functions list --gen2 --format="table(name,state,environment)" 2>&1 | grep -q "Listed 0 items"; then
    echo "No Gen 2 functions found." >> "$OUTPUT_DIR/cloud-functions.md"
elif gcloud functions list --gen2 --format="table(name,state,environment)" &> /dev/null; then
    {
        echo '```'
        gcloud functions list --gen2 --format="table(name,state,environment)" 2>&1
        echo '```'
        echo ""
    } >> "$OUTPUT_DIR/cloud-functions.md"
else
    echo "⚠️ **Could not check Gen 2 functions**" >> "$OUTPUT_DIR/cloud-functions.md"
fi

# ===================================================================
# 3. PUB/SUB TOPICS
# ===================================================================
echo -e "${YELLOW}[3/7] Scanning Pub/Sub topics...${NC}"

cat > "$OUTPUT_DIR/pubsub-topics.md" << EOF
# Pub/Sub Topics Inventory
Generated: $(date '+%Y-%m-%d %H:%M:%S')
Project: ${PROJECT_ID}

## Topics

EOF

if gcloud pubsub topics list --format="table(name)" &> /dev/null; then
    {
        echo '```'
        gcloud pubsub topics list --format="table(name)" 2>&1
        echo '```'
        echo ""
        
        # Get subscriptions for each topic
        echo "## Subscriptions by Topic"
        echo ""
        
        topics=$(gcloud pubsub topics list --format="value(name)" 2>&1 | grep -v "Listed 0 items" || true)
        if [ -n "$topics" ]; then
            while IFS= read -r topic; do
                if [ -n "$topic" ]; then
                    echo "### Topic: $topic"
                    echo '```'
                    gcloud pubsub subscriptions list --format="table(name,ackDeadlineSeconds,messageRetentionDuration)" \
                        --filter="topic:$topic" 2>&1 || echo "No subscriptions found"
                    echo '```'
                    echo ""
                fi
            done <<< "$topics"
        else
            echo "No Pub/Sub topics found."
            echo ""
        fi
    } >> "$OUTPUT_DIR/pubsub-topics.md"
    echo -e "${GREEN}  ✅ Pub/Sub topics captured${NC}"
else
    echo "⚠️ **Could not access Pub/Sub topics** (API may not be enabled)" >> "$OUTPUT_DIR/pubsub-topics.md"
    echo -e "${YELLOW}  ⚠️  Could not access Pub/Sub topics${NC}"
fi

# ===================================================================
# 4. FIRESTORE DATABASES
# ===================================================================
echo -e "${YELLOW}[4/7] Scanning Firestore databases...${NC}"

cat > "$OUTPUT_DIR/firestore-databases.md" << EOF
# Firestore Databases Inventory
Generated: $(date '+%Y-%m-%d %H:%M:%S')
Project: ${PROJECT_ID}

## Databases

EOF

if gcloud firestore databases list --format="table(name,type,locationId)" &> /dev/null; then
    {
        echo '```'
        gcloud firestore databases list --format="table(name,type,locationId)" 2>&1
        echo '```'
        echo ""
        
        # Try to list collections (may require additional permissions)
        echo "## Collections"
        echo ""
        echo "⚠️ **Note:** Collection listing requires Firestore access. Run manually with:"
        echo '```bash'
        echo 'gcloud firestore collections list --database="(default)"'
        echo '```'
        echo ""
    } >> "$OUTPUT_DIR/firestore-databases.md"
    echo -e "${GREEN}  ✅ Firestore databases captured${NC}"
else
    echo "⚠️ **Could not access Firestore databases** (API may not be enabled or no databases exist)" >> "$OUTPUT_DIR/firestore-databases.md"
    echo -e "${YELLOW}  ⚠️  Could not access Firestore databases${NC}"
fi

# ===================================================================
# 5. CLOUD SQL INSTANCES
# ===================================================================
echo -e "${YELLOW}[5/7] Scanning Cloud SQL instances...${NC}"

cat > "$OUTPUT_DIR/cloudsql-instances.md" << EOF
# Cloud SQL Instances Inventory
Generated: $(date '+%Y-%m-%d %H:%M:%S')
Project: ${PROJECT_ID}

## Instances

EOF

if gcloud sql instances list --format="table(name,databaseVersion,region,tier,state)" &> /dev/null; then
    {
        echo '```'
        gcloud sql instances list --format="table(name,databaseVersion,region,tier,state)" 2>&1
        echo '```'
        echo ""
        
        # Get detailed info for each instance
        echo "## Detailed Instance Information"
        echo ""
        
        instances=$(gcloud sql instances list --format="value(name)" 2>&1 | grep -v "Listed 0 items" || true)
        if [ -n "$instances" ]; then
            while IFS= read -r instance; do
                if [ -n "$instance" ]; then
                    echo "### Instance: $instance"
                    echo '```yaml'
                    gcloud sql instances describe "$instance" --format="yaml" 2>&1 || echo "Failed to describe instance"
                    echo '```'
                    echo ""
                    
                    # List databases in the instance
                    echo "#### Databases in $instance"
                    echo '```'
                    gcloud sql databases list --instance="$instance" --format="table(name,charset,collation)" 2>&1 || echo "Failed to list databases"
                    echo '```'
                    echo ""
                fi
            done <<< "$instances"
        else
            echo "No Cloud SQL instances found."
            echo ""
        fi
    } >> "$OUTPUT_DIR/cloudsql-instances.md"
    echo -e "${GREEN}  ✅ Cloud SQL instances captured${NC}"
else
    echo "⚠️ **Could not access Cloud SQL instances** (API may not be enabled)" >> "$OUTPUT_DIR/cloudsql-instances.md"
    echo -e "${YELLOW}  ⚠️  Could not access Cloud SQL instances${NC}"
fi

# ===================================================================
# 6. IAM POLICIES
# ===================================================================
echo -e "${YELLOW}[6/7] Exporting IAM policies...${NC}"

cat > "$OUTPUT_DIR/iam-policies.md" << EOF
# IAM Policies Export
Generated: $(date '+%Y-%m-%d %H:%M:%S')
Project: ${PROJECT_ID}

## Project IAM Policy

EOF

if gcloud projects get-iam-policy "$PROJECT_ID" --format="yaml" &> /dev/null; then
    {
        echo '```yaml'
        gcloud projects get-iam-policy "$PROJECT_ID" --format="yaml" 2>&1
        echo '```'
        echo ""
        
        # Get service accounts
        echo "## Service Accounts"
        echo ""
        echo '```'
        gcloud iam service-accounts list --format="table(email,displayName,disabled)" 2>&1
        echo '```'
        echo ""
    } >> "$OUTPUT_DIR/iam-policies.md"
    echo -e "${GREEN}  ✅ IAM policies exported${NC}"
else
    echo "⚠️ **Could not export IAM policies** (insufficient permissions)" >> "$OUTPUT_DIR/iam-policies.md"
    echo -e "${YELLOW}  ⚠️  Could not export IAM policies${NC}"
fi

# ===================================================================
# 7. PROJECT SUMMARY
# ===================================================================
echo -e "${YELLOW}[7/7] Generating summary...${NC}"

cat > "$OUTPUT_DIR/summary.md" << EOF
# Vizual-X GCP Inventory Summary
Generated: $(date '+%Y-%m-%d %H:%M:%S')
Project: ${PROJECT_ID}

## Inventory Overview

This forensic inventory captured the complete state of Google Cloud Platform resources.

## Files Generated

1. \`cloudrun-services.md\` - Cloud Run services and configurations
2. \`cloud-functions.md\` - Cloud Functions (Gen 1 and Gen 2)
3. \`pubsub-topics.md\` - Pub/Sub topics and subscriptions
4. \`firestore-databases.md\` - Firestore database inventory
5. \`cloudsql-instances.md\` - Cloud SQL instances and databases
6. \`iam-policies.md\` - IAM policies and service accounts
7. \`summary.md\` - This file

## Quick Resource Count

EOF

# Count resources
cloudrun_count=$(gcloud run services list --format="value(name)" 2>/dev/null | wc -l)
functions_count=$(gcloud functions list --format="value(name)" 2>/dev/null | wc -l)
pubsub_count=$(gcloud pubsub topics list --format="value(name)" 2>/dev/null | wc -l)
firestore_count=$(gcloud firestore databases list --format="value(name)" 2>/dev/null | wc -l)
sql_count=$(gcloud sql instances list --format="value(name)" 2>/dev/null | wc -l)
sa_count=$(gcloud iam service-accounts list --format="value(email)" 2>/dev/null | wc -l)

cat >> "$OUTPUT_DIR/summary.md" << EOF
- **Cloud Run Services:** $cloudrun_count
- **Cloud Functions:** $functions_count
- **Pub/Sub Topics:** $pubsub_count
- **Firestore Databases:** $firestore_count
- **Cloud SQL Instances:** $sql_count
- **Service Accounts:** $sa_count

## Next Steps

1. Review each inventory report for completeness
2. Compare with local system audit (run \`audit-local-system.ps1\`)
3. Compare with GitHub audit (check \`.github/workflows/github-forensic-audit.yml\`)
4. Consolidate findings using the \`00_SYSTEM_CONSOLIDATION_PLAN.md\` guide

## Additional Commands

To export additional resources, consider running:

\`\`\`bash
# List all compute instances
gcloud compute instances list --format="table(name,zone,machineType,status)"

# List all storage buckets
gcloud storage buckets list --format="table(name,location,storageClass)"

# List all secrets
gcloud secrets list --format="table(name,created)"

# List all APIs enabled
gcloud services list --enabled --format="table(name,title)"
\`\`\`

---
*Generated by Vizual-X Forensic Toolkit*
EOF

echo -e "${GREEN}  ✅ Summary generated${NC}"

# ===================================================================
# COMPLETION
# ===================================================================
echo ""
echo "═══════════════════════════════════════════════════════════"
echo "    INVENTORY COMPLETE"
echo "═══════════════════════════════════════════════════════════"
echo ""
echo -e "${YELLOW}📁 Inventory reports saved to: ${OUTPUT_DIR}${NC}"
echo ""
echo -e "${CYAN}Generated files:${NC}"
echo "  - cloudrun-services.md"
echo "  - cloud-functions.md"
echo "  - pubsub-topics.md"
echo "  - firestore-databases.md"
echo "  - cloudsql-instances.md"
echo "  - iam-policies.md"
echo "  - summary.md"
echo ""
echo -e "${YELLOW}Review the summary.md file for next steps.${NC}"
echo ""
