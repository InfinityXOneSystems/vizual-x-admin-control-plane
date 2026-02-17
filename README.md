<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1oiktXBWh0yMNn1NxXLcFb_oT6O92CNJ0

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## CI/CD Pipeline

The project includes a preflight CI workflow that runs on every push and pull request:
- Type checking with TypeScript
- Build verification
- Automated dependency updates via Dependabot (weekly)

See [`.github/workflows/preflight.yml`](.github/workflows/preflight.yml) for details.

## Security

Security scanning and vulnerability management procedures are documented in [SECURITY_PRECHECK.md](SECURITY_PRECHECK.md). This includes:
- NPM audit procedures
- Container scanning with Trivy
- Response procedures for security findings
