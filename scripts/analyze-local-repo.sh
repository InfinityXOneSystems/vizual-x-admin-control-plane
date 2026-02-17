#!/bin/bash

# ===================================================================
# VIZUAL-X ADMIN CONTROL PLANE - LOCAL REPOSITORY ANALYZER (Bash)
# ===================================================================
# Purpose: Comprehensive analysis of local repository state,
#          identifying issues preventing GitHub push and merge
# Usage: ./analyze-local-repo.sh [--report]
# ===================================================================

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

GENERATE_REPORT=false
REPORT_PATH="repo-analysis-report.md"

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --report)
            GENERATE_REPORT=true
            shift
            ;;
        *)
            shift
            ;;
    esac
done

echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}    VIZUAL-X REPOSITORY ANALYZER v1.0${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Initialize report
if [ "$GENERATE_REPORT" = true ]; then
    echo "# Vizual-X Repository Analysis Report" > "$REPORT_PATH"
    echo "Generated: $(date '+%Y-%m-%d %H:%M:%S')" >> "$REPORT_PATH"
    echo "" >> "$REPORT_PATH"
fi

# ===================================================================
# 1. REPOSITORY SIZE ANALYSIS
# ===================================================================
echo -e "${YELLOW}[1/10] Analyzing repository size...${NC}"

REPO_SIZE=$(du -sm . 2>/dev/null | cut -f1)

if [ "$GENERATE_REPORT" = true ]; then
    echo "## 1. Repository Size" >> "$REPORT_PATH"
    echo "**Total Size:** ${REPO_SIZE} MB" >> "$REPORT_PATH"
    echo "" >> "$REPORT_PATH"
fi

if [ "$REPO_SIZE" -gt 100 ]; then
    echo -e "  ${RED}⚠️  WARNING: Repository size exceeds 100 MB!${NC}"
    if [ "$GENERATE_REPORT" = true ]; then
        echo "⚠️ **WARNING:** Repository exceeds recommended size (100 MB). Consider using Git LFS for large files." >> "$REPORT_PATH"
        echo "" >> "$REPORT_PATH"
    fi
else
    echo -e "  ${GREEN}✅ Repository size: ${REPO_SIZE} MB${NC}"
fi

# ===================================================================
# 2. LARGE FILES DETECTION (>10MB)
# ===================================================================
echo -e "${YELLOW}[2/10] Detecting large files (>10MB)...${NC}"

LARGE_FILES=$(find . -type f -size +10M 2>/dev/null | grep -v ".git" | head -20)

if [ "$GENERATE_REPORT" = true ]; then
    echo "## 2. Large Files (>10MB)" >> "$REPORT_PATH"
fi

if [ -n "$LARGE_FILES" ]; then
    FILE_COUNT=$(echo "$LARGE_FILES" | wc -l)
    echo -e "  ${RED}🔍 Found ${FILE_COUNT} large file(s):${NC}"
    
    if [ "$GENERATE_REPORT" = true ]; then
        echo "**Found:** ${FILE_COUNT} file(s)" >> "$REPORT_PATH"
        echo "| File | Size (MB) |" >> "$REPORT_PATH"
        echo "|------|-----------|" >> "$REPORT_PATH"
    fi
    
    echo "$LARGE_FILES" | while read -r file; do
        SIZE=$(du -h "$file" 2>/dev/null | cut -f1)
        echo -e "    ${MAGENTA}- $file ($SIZE)${NC}"
        if [ "$GENERATE_REPORT" = true ]; then
            echo "| $file | $SIZE |" >> "$REPORT_PATH"
        fi
    done
else
    echo -e "  ${GREEN}✅ No large files found${NC}"
    if [ "$GENERATE_REPORT" = true ]; then
        echo "✅ No large files detected" >> "$REPORT_PATH"
    fi
fi

if [ "$GENERATE_REPORT" = true ]; then
    echo "" >> "$REPORT_PATH"
fi

# ===================================================================
# 3. GIT STATUS CHECK
# ===================================================================
echo -e "${YELLOW}[3/10] Checking Git status...${NC}"

GIT_STATUS=$(git status --porcelain 2>&1)

if [ "$GENERATE_REPORT" = true ]; then
    echo "## 3. Git Status" >> "$REPORT_PATH"
fi

if [ -n "$GIT_STATUS" ]; then
    UNCOMMITTED=$(echo "$GIT_STATUS" | wc -l)
    echo -e "  ${RED}⚠️  Found ${UNCOMMITTED} uncommitted changes${NC}"
    if [ "$GENERATE_REPORT" = true ]; then
        echo "**Uncommitted changes:** ${UNCOMMITTED}" >> "$REPORT_PATH"
        echo '```' >> "$REPORT_PATH"
        echo "$GIT_STATUS" >> "$REPORT_PATH"
        echo '```' >> "$REPORT_PATH"
    fi
else
    echo -e "  ${GREEN}✅ Working directory clean${NC}"
    if [ "$GENERATE_REPORT" = true ]; then
        echo "✅ Working directory is clean" >> "$REPORT_PATH"
    fi
fi

if [ "$GENERATE_REPORT" = true ]; then
    echo "" >> "$REPORT_PATH"
fi

# ===================================================================
# 4. BRANCH ANALYSIS
# ===================================================================
echo -e "${YELLOW}[4/10] Analyzing branches...${NC}"

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
echo -e "  ${CYAN}Current branch: $CURRENT_BRANCH${NC}"

if [ "$GENERATE_REPORT" = true ]; then
    echo "## 4. Branch Analysis" >> "$REPORT_PATH"
    echo "**Current branch:** $CURRENT_BRANCH" >> "$REPORT_PATH"
    echo "" >> "$REPORT_PATH"
    echo "**All branches:**" >> "$REPORT_PATH"
    echo '```' >> "$REPORT_PATH"
    git branch -a >> "$REPORT_PATH"
    echo '```' >> "$REPORT_PATH"
    echo "" >> "$REPORT_PATH"
fi

# ===================================================================
# 5. UNTRACKED FILES
# ===================================================================
echo -e "${YELLOW}[5/10] Detecting untracked files...${NC}"

UNTRACKED=$(git ls-files --others --exclude-standard 2>/dev/null)

if [ "$GENERATE_REPORT" = true ]; then
    echo "## 5. Untracked Files" >> "$REPORT_PATH"
fi

if [ -n "$UNTRACKED" ]; then
    UNTRACKED_COUNT=$(echo "$UNTRACKED" | wc -l)
    echo -e "  ${YELLOW}🔍 Found ${UNTRACKED_COUNT} untracked file(s)${NC}"
    if [ "$GENERATE_REPORT" = true ]; then
        echo "**Count:** ${UNTRACKED_COUNT}" >> "$REPORT_PATH"
        echo '```' >> "$REPORT_PATH"
        echo "$UNTRACKED" >> "$REPORT_PATH"
        echo '```' >> "$REPORT_PATH"
    fi
else
    echo -e "  ${GREEN}✅ No untracked files${NC}"
    if [ "$GENERATE_REPORT" = true ]; then
        echo "✅ No untracked files" >> "$REPORT_PATH"
    fi
fi

if [ "$GENERATE_REPORT" = true ]; then
    echo "" >> "$REPORT_PATH"
fi

# ===================================================================
# 6. NODE_MODULES CHECK
# ===================================================================
echo -e "${YELLOW}[6/10] Checking for node_modules in git...${NC}"

NODE_MODULES_IN_GIT=$(git ls-files 2>/dev/null | grep "node_modules")

if [ "$GENERATE_REPORT" = true ]; then
    echo "## 6. Dependencies Check" >> "$REPORT_PATH"
fi

if [ -n "$NODE_MODULES_IN_GIT" ]; then
    echo -e "  ${RED}⚠️  WARNING: node_modules found in git tracking!${NC}"
    if [ "$GENERATE_REPORT" = true ]; then
        echo "⚠️ **WARNING:** node_modules are being tracked by git (should be in .gitignore)" >> "$REPORT_PATH"
        echo '```' >> "$REPORT_PATH"
        echo "$NODE_MODULES_IN_GIT" >> "$REPORT_PATH"
        echo '```' >> "$REPORT_PATH"
    fi
else
    echo -e "  ${GREEN}✅ node_modules properly ignored${NC}"
    if [ "$GENERATE_REPORT" = true ]; then
        echo "✅ node_modules properly excluded from git" >> "$REPORT_PATH"
    fi
fi

if [ "$GENERATE_REPORT" = true ]; then
    echo "" >> "$REPORT_PATH"
fi

# ===================================================================
# 7. .GITIGNORE ANALYSIS
# ===================================================================
echo -e "${YELLOW}[7/10] Analyzing .gitignore...${NC}"

if [ "$GENERATE_REPORT" = true ]; then
    echo "## 7. .gitignore Analysis" >> "$REPORT_PATH"
fi

if [ -f ".gitignore" ]; then
    LINE_COUNT=$(wc -l < .gitignore)
    
    if [ "$GENERATE_REPORT" = true ]; then
        echo "**File exists:** ✅" >> "$REPORT_PATH"
        echo "**Lines:** ${LINE_COUNT}" >> "$REPORT_PATH"
    fi
    
    # Check for problematic patterns
    if grep -q "^\*\.json$" .gitignore || grep -q "^\*\.txt$" .gitignore; then
        echo -e "  ${RED}⚠️  WARNING: Overly broad ignore patterns found!${NC}"
        if [ "$GENERATE_REPORT" = true ]; then
            echo "" >> "$REPORT_PATH"
            echo "⚠️ **CRITICAL:** Overly broad patterns detected (may ignore essential files)" >> "$REPORT_PATH"
            echo "**Recommendation:** Update .gitignore to explicitly allow:" >> "$REPORT_PATH"
            echo "- \`!package.json\`" >> "$REPORT_PATH"
            echo "- \`!tsconfig.json\`" >> "$REPORT_PATH"
            echo "- \`!manifest.json\`" >> "$REPORT_PATH"
        fi
    else
        echo -e "  ${GREEN}✅ .gitignore appears correctly configured${NC}"
    fi
else
    echo -e "  ${RED}⚠️  WARNING: No .gitignore file found!${NC}"
    if [ "$GENERATE_REPORT" = true ]; then
        echo "⚠️ **WARNING:** No .gitignore file found" >> "$REPORT_PATH"
    fi
fi

if [ "$GENERATE_REPORT" = true ]; then
    echo "" >> "$REPORT_PATH"
fi

# ===================================================================
# 8. REMOTE REPOSITORY CONNECTION
# ===================================================================
echo -e "${YELLOW}[8/10] Checking remote repository...${NC}"

if [ "$GENERATE_REPORT" = true ]; then
    echo "## 8. Remote Repository" >> "$REPORT_PATH"
    echo '```' >> "$REPORT_PATH"
    git remote -v >> "$REPORT_PATH"
    echo '```' >> "$REPORT_PATH"
    echo "" >> "$REPORT_PATH"
fi

if git ls-remote --heads origin &>/dev/null; then
    echo -e "  ${GREEN}✅ Remote connection successful${NC}"
    if [ "$GENERATE_REPORT" = true ]; then
        echo "✅ Remote connection verified" >> "$REPORT_PATH"
    fi
else
    echo -e "  ${RED}⚠️  Cannot connect to remote${NC}"
    if [ "$GENERATE_REPORT" = true ]; then
        echo "⚠️ Cannot verify remote connection" >> "$REPORT_PATH"
    fi
fi

if [ "$GENERATE_REPORT" = true ]; then
    echo "" >> "$REPORT_PATH"
fi

# ===================================================================
# 9. UNPUSHED COMMITS
# ===================================================================
echo -e "${YELLOW}[9/10] Checking for unpushed commits...${NC}"

UNPUSHED=$(git log origin/$CURRENT_BRANCH..$CURRENT_BRANCH --oneline 2>/dev/null)

if [ "$GENERATE_REPORT" = true ]; then
    echo "## 9. Unpushed Commits" >> "$REPORT_PATH"
fi

if [ -n "$UNPUSHED" ]; then
    COMMIT_COUNT=$(echo "$UNPUSHED" | wc -l)
    echo -e "  ${YELLOW}🔍 Found ${COMMIT_COUNT} unpushed commit(s)${NC}"
    if [ "$GENERATE_REPORT" = true ]; then
        echo "**Count:** ${COMMIT_COUNT}" >> "$REPORT_PATH"
        echo '```' >> "$REPORT_PATH"
        echo "$UNPUSHED" >> "$REPORT_PATH"
        echo '```' >> "$REPORT_PATH"
    fi
else
    echo -e "  ${GREEN}✅ All commits pushed or branch not tracking remote${NC}"
    if [ "$GENERATE_REPORT" = true ]; then
        echo "✅ No unpushed commits or branch not tracking remote" >> "$REPORT_PATH"
    fi
fi

if [ "$GENERATE_REPORT" = true ]; then
    echo "" >> "$REPORT_PATH"
fi

# ===================================================================
# 10. MONACO EDITOR CHECK
# ===================================================================
echo -e "${YELLOW}[10/10] Checking Monaco Editor files...${NC}"

MONACO_FILES=(
    "components/MonacoEditor.tsx"
    "vscode-extension-kit/src/providers/MonacoEditorProvider.ts"
    "MONACO_DEPLOYMENT_BLUEPRINT.md"
)

if [ "$GENERATE_REPORT" = true ]; then
    echo "## 10. Monaco Editor Files" >> "$REPORT_PATH"
    echo "| File | Status |" >> "$REPORT_PATH"
    echo "|------|--------|" >> "$REPORT_PATH"
fi

for file in "${MONACO_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✅ $file${NC}"
        if [ "$GENERATE_REPORT" = true ]; then
            echo "| $file | ✅ Exists |" >> "$REPORT_PATH"
        fi
    else
        echo -e "  ${RED}❌ $file (missing)${NC}"
        if [ "$GENERATE_REPORT" = true ]; then
            echo "| $file | ❌ Missing |" >> "$REPORT_PATH"
        fi
    fi
done

if [ "$GENERATE_REPORT" = true ]; then
    echo "" >> "$REPORT_PATH"
fi

# ===================================================================
# SUMMARY
# ===================================================================
echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}    ANALYSIS COMPLETE${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
echo ""

if [ "$GENERATE_REPORT" = true ]; then
    echo "## Summary & Recommendations" >> "$REPORT_PATH"
    echo "" >> "$REPORT_PATH"
    echo "---" >> "$REPORT_PATH"
    echo "*Generated by Vizual-X Repository Analyzer*" >> "$REPORT_PATH"
    
    echo -e "${CYAN}📄 Report saved to: $REPORT_PATH${NC}"
fi

echo -e "${YELLOW}For next steps, see: MONACO_DEPLOYMENT_BLUEPRINT.md${NC}"
echo ""
