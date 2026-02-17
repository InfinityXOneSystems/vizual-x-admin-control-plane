# Preflight Guardian CI/CD Pipeline

## Overview

The **Preflight Guardian** is a zero-tolerance validation pipeline designed to act as the foundational validation layer for autonomous AI coding workflows. It provides definitive pass/fail feedback with actionable error messages that AI agents can parse and use for self-correction.

## Workflow File

- **Location**: `.github/workflows/preflight-guardian.yml`
- **Workflow Name**: `Preflight Guardian`

## Triggers

The workflow automatically runs on:

1. **Pull Requests** targeting the `main` branch
2. **Push events** to:
   - `main` branch
   - `feature/**` branches
   - `fix/**` branches
   - `copilot/**` branches

## Validation Gates

### 1. 📦 Dependency Check
- **Purpose**: Ensures reproducible builds
- **Command**: `npm ci --verbose`
- **Features**:
  - Uses npm cache for faster subsequent runs
  - Installs exact versions from `package-lock.json`
  - Fails fast if dependencies are inconsistent

### 2. 🔍 Type Safety Check
- **Purpose**: Validates TypeScript type correctness
- **Command**: `npm run typecheck`
- **Features**:
  - Runs `tsc --noEmit` to check types without generating output
  - Captures detailed error logs for AI agent parsing
  - Provides specific file and line number references

### 3. 🧹 Code Integrity Check
- **Purpose**: Validates code syntax and structure
- **Command**: `npx tsc --noEmit --skipLibCheck`
- **Features**:
  - Performs comprehensive syntax validation
  - Independent verification beyond standard type checking
  - Catches structural issues early

### 4. 🏗️ Build Verification
- **Purpose**: Proves code compiles for production
- **Command**: `npm run build`
- **Features**:
  - Full production build using Vite
  - Verifies all imports and dependencies resolve
  - Ensures deployment readiness

## Error Handling

Each validation step includes:

- **Grouped Output**: Uses GitHub Actions groups for clean, collapsible logs
- **Error Logs**: Captures full output to `.log` files
- **Actionable Messages**: Provides specific commands and next steps for AI agents
- **Exit Codes**: Reliable exit code handling using `set -o pipefail`

Example error message format:
```
::error::❌ Type check failed. Review errors above.
::error::Command: npm run typecheck
::error::AI Agent Action: Fix type errors reported in typecheck.log
```

## Artifacts

On failure, the workflow uploads diagnostic logs as artifacts:
- `typecheck.log` - Type checking errors
- `integrity.log` - Syntax validation errors
- `build.log` - Build errors

**Retention**: 7 days

## Security

The workflow follows the principle of least privilege:
- **Permissions**: `contents: read` only
- No write access to repository
- No access to secrets or tokens beyond default `GITHUB_TOKEN`

## Requirements

### package.json Scripts
The workflow requires these npm scripts to be defined:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "vite build"
  }
}
```

### tsconfig.json
A valid `tsconfig.json` must exist at the repository root with appropriate TypeScript configuration.

#### Current Exclusions
The following paths are excluded from type checking due to missing dependencies:
- `vscode-extension-kit/` - Requires VS Code extension API
- `services/OrchestratorConnector.ts` - Requires axios package

## Integration with Autonomous AI Workflows

The Preflight Guardian is designed to support the "Auto-Everything" architecture by:

1. **Zero Tolerance**: Any validation failure prevents merge
2. **Actionable Feedback**: Error messages are structured for AI parsing
3. **Self-Correction Loop**: AI agents can read logs and fix issues automatically
4. **Reproducibility**: Consistent validation across all environments

## Future Enhancements

Consider enabling stricter TypeScript options in `tsconfig.json` as the codebase matures:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitReturns": true
  }
}
```

## Troubleshooting

### Workflow Requires Approval
First-time workflows may require approval in GitHub Actions settings:
1. Go to repository Settings → Actions → General
2. Under "Fork pull request workflows from outside collaborators"
3. Approve the workflow run

### Type Check Failures
- Check `typecheck.log` artifact for detailed errors
- Ensure all imports have proper type definitions
- Verify `tsconfig.json` configuration is correct

### Build Failures
- Check `build.log` artifact for detailed errors
- Ensure all dependencies are installed via `package-lock.json`
- Verify Vite configuration in `vite.config.ts`

## Related Documentation

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
