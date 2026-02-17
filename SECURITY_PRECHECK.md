# Security Precheck Runbook

This document provides steps for running security scans and responding to findings in the Vizual-X Admin Control Plane project.

## Prerequisites

- Node.js 20.x or higher
- Docker (for container scanning)
- Trivy (install: `brew install trivy` or see [Trivy installation guide](https://aquasecurity.github.io/trivy/latest/getting-started/installation/))

## NPM Audit

### Running NPM Audit

```bash
# Run audit for all dependencies
npm audit

# Run audit with detailed output
npm audit --json

# Run audit for production dependencies only
npm audit --production
```

### Responding to NPM Audit Findings

1. **Critical/High Vulnerabilities**: 
   - Review the vulnerability details and affected packages
   - Update to patched versions: `npm audit fix`
   - For breaking changes: `npm audit fix --force` (use with caution)
   - If no fix is available, consider alternative packages or file an issue

2. **Moderate/Low Vulnerabilities**:
   - Assess the risk based on your application's usage
   - Plan updates in regular dependency maintenance cycles
   - Document accepted risks if mitigation is not feasible

3. **No Fix Available**:
   - Check for alternative packages
   - Implement workarounds if possible
   - Monitor for future updates
   - Consider creating a GitHub security advisory

## Container Security Scanning with Trivy

### Scanning the Python Backend Docker Image

```bash
# Build the Docker image
cd backend/python-engine
docker build -t vizual-x-python-engine:latest .

# Run Trivy scan
trivy image vizual-x-python-engine:latest

# Generate JSON report
trivy image --format json --output trivy-report.json vizual-x-python-engine:latest

# Scan for critical and high vulnerabilities only
trivy image --severity CRITICAL,HIGH vizual-x-python-engine:latest
```

### Scanning for Misconfigurations

```bash
# Scan Dockerfile for misconfigurations
trivy config backend/python-engine/Dockerfile

# Scan infrastructure as code
trivy config infra/
```

### Responding to Trivy Findings

1. **Base Image Vulnerabilities**:
   - Update to the latest patch version: `python:3.11-slim` → check for newer tags
   - Consider using distroless or minimal base images
   - Update the Dockerfile with the new base image tag

2. **Python Package Vulnerabilities**:
   - Update requirements.txt with patched versions
   - Run `pip list --outdated` to check for available updates
   - Test thoroughly after updates

3. **Configuration Issues**:
   - Follow Trivy's remediation advice
   - Ensure containers run as non-root users (already implemented)
   - Set appropriate file permissions

4. **False Positives**:
   - Use `.trivyignore` file to suppress known false positives
   - Document the reason for suppression
   - Example `.trivyignore` entry:
     ```
     # False positive: package X is not actually used in runtime
     CVE-2023-12345
     ```

## Regular Security Maintenance

1. **Weekly**: Review Dependabot pull requests and merge approved updates
2. **Monthly**: Run full security scans (npm audit + Trivy)
3. **Quarterly**: Review and update security policies and runbooks
4. **On-Demand**: Run scans before major releases or when security advisories are published

## Escalation

If you discover a critical security vulnerability:

1. Do not create a public issue
2. Follow responsible disclosure practices
3. Contact the security team or repository maintainers privately
4. Consider using GitHub Security Advisories for coordinated disclosure

## Additional Resources

- [npm audit documentation](https://docs.npmjs.com/cli/v9/commands/npm-audit)
- [Trivy documentation](https://aquasecurity.github.io/trivy/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [GitHub Security Advisories](https://docs.github.com/en/code-security/security-advisories)
