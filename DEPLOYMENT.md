# Cloud Run Deployment Guide

This guide explains how to deploy the Vizual-X Mission Control landing page to Google Cloud Run.

## Prerequisites

1. **Google Cloud SDK**: Install from https://cloud.google.com/sdk/docs/install
2. **GCP Project**: `infinity-x-one-system`
3. **Authentication**: Run `gcloud auth login`
4. **Permissions**: Ensure you have Cloud Run Admin and Cloud Build Editor roles

## Quick Deploy

To deploy the frontend to Cloud Run:

```bash
./scripts/deploy-frontend.sh
```

This script will:
1. Build the Docker image using Cloud Build
2. Deploy to Cloud Run in `us-central1`
3. Configure the service to allow unauthenticated access
4. Set necessary environment variables

## Manual Deployment Steps

If you prefer to deploy manually:

### 1. Build the Docker Image

```bash
gcloud builds submit \
  --tag gcr.io/infinity-x-one-system/vizual-x-frontend \
  -f Dockerfile.frontend \
  .
```

### 2. Deploy to Cloud Run

```bash
gcloud run deploy vizual-x-frontend \
  --image gcr.io/infinity-x-one-system/vizual-x-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 1 \
  --max-instances 10 \
  --set-env-vars "NODE_ENV=production,VITE_API_URL=https://api.vizual-x.com"
```

### 3. Map Custom Domain

To map `vizual-x.com` to the service:

```bash
gcloud run domain-mappings create \
  --service vizual-x-frontend \
  --domain vizual-x.com \
  --region us-central1
```

You'll need to configure DNS records as instructed by the output.

## Files Overview

- **`Dockerfile.frontend`**: Multi-stage Docker build for the React frontend
  - Stage 1: Build with Node.js
  - Stage 2: Serve with nginx on port 8080

- **`nginx.conf`**: Nginx configuration for serving the SPA
  - Enables gzip compression
  - Handles SPA routing (fallback to index.html)
  - Adds security headers
  - Caches static assets

- **`infra/cloud-run-service.yaml`**: Knative service definition
  - Declarative Cloud Run service configuration
  - Can be applied with `gcloud run services replace`

- **`scripts/deploy-frontend.sh`**: Automated deployment script

## Local Testing

To test the Docker build locally:

```bash
# Build the image
docker build -f Dockerfile.frontend -t vizual-x-frontend .

# Run locally
docker run -p 8080:8080 vizual-x-frontend

# Visit http://localhost:8080
```

## Environment Variables

The following environment variables can be configured:

- `NODE_ENV`: Set to `production` for production builds
- `VITE_API_URL`: Backend API URL (default: `https://api.vizual-x.com`)

## Troubleshooting

### Build Fails

If the build fails, check:
1. Node dependencies are correctly specified in `package.json`
2. `npm run build` works locally
3. Cloud Build service account has necessary permissions

### Service Won't Start

If the service won't start:
1. Check logs: `gcloud run services logs read vizual-x-frontend --region us-central1`
2. Verify port 8080 is exposed and nginx is listening
3. Check nginx configuration syntax

### Domain Mapping Issues

If domain mapping fails:
1. Ensure you have domain verification set up
2. Configure DNS as instructed by Cloud Run
3. Wait for DNS propagation (can take up to 48 hours)

## Monitoring

View logs:
```bash
gcloud run services logs read vizual-x-frontend --region us-central1 --limit 50
```

View service details:
```bash
gcloud run services describe vizual-x-frontend --region us-central1
```

## Cost Optimization

The service is configured with:
- **Min instances**: 1 (always available, prevents cold starts)
- **Max instances**: 10 (scales up to 10 concurrent instances)
- **Memory**: 512Mi (sufficient for nginx static serving)
- **CPU**: 1 (standard allocation)

To reduce costs, you can adjust `--min-instances` to 0 in the deployment script, but this will introduce cold start latency.
