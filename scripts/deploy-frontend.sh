#!/bin/bash

# Deploy Vizual-X Frontend to Cloud Run
# This script builds and deploys the Mission Control landing page

set -e

# Configuration
PROJECT_ID="infinity-x-one-system"
SERVICE_NAME="vizual-x-frontend"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Starting deployment of Vizual-X Frontend to Cloud Run..."
echo "=================================================="

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo "❌ Error: Not authenticated with gcloud"
    echo "Please run: gcloud auth login"
    exit 1
fi

# Set the project
echo "📦 Setting GCP project to: ${PROJECT_ID}"
gcloud config set project "${PROJECT_ID}"

# Build the Docker image using Cloud Build
echo "🔨 Building Docker image..."
gcloud builds submit \
    --tag "${IMAGE_NAME}" \
    --timeout=20m \
    --machine-type=n1-highcpu-8 \
    -f Dockerfile.frontend \
    .

if [ $? -ne 0 ]; then
    echo "❌ Error: Docker image build failed"
    exit 1
fi

echo "✅ Docker image built successfully: ${IMAGE_NAME}"

# Deploy to Cloud Run
echo "🚢 Deploying to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
    --image "${IMAGE_NAME}" \
    --platform managed \
    --region "${REGION}" \
    --allow-unauthenticated \
    --port 8080 \
    --memory 512Mi \
    --cpu 1 \
    --min-instances 1 \
    --max-instances 10 \
    --set-env-vars "NODE_ENV=production,VITE_API_URL=https://api.vizual-x.com"

if [ $? -ne 0 ]; then
    echo "❌ Error: Cloud Run deployment failed"
    exit 1
fi

echo "✅ Deployment successful!"

# Get the service URL
SERVICE_URL=$(gcloud run services describe "${SERVICE_NAME}" \
    --platform managed \
    --region "${REGION}" \
    --format 'value(status.url)')

echo "=================================================="
echo "🎉 Deployment complete!"
echo "📍 Service URL: ${SERVICE_URL}"
echo ""
echo "Next steps:"
echo "1. Map custom domain 'vizual-x.com' to this service:"
echo "   gcloud run domain-mappings create --service ${SERVICE_NAME} --domain vizual-x.com --region ${REGION}"
echo ""
echo "2. Verify the deployment:"
echo "   curl ${SERVICE_URL}"
echo "=================================================="
