#!/usr/bin/env bash

set -e

# ============================================================
# INPUTS YOU NEED TO CHANGE
# ============================================================

# Your Google Cloud project ID
PROJECT_ID="futury-accel26fra-513"

# Cloud Run region
# Example: europe-west1, europe-west3, us-central1
REGION="europe-west1"

# Artifact Registry repository name
# This repo stores your Docker image.
REPO_NAME="my-freoessen-repo"

# Cloud Run service name
# This is the name of your deployed app.
SERVICE_NAME="backend"

# Docker image name
IMAGE_NAME="viega-intelligence"

# Docker image tag
# You can use latest, dev, v1, etc.
IMAGE_TAG="latest"

# Path to your Dockerfile/project folder
# "." means current folder.
DOCKER_CONTEXT="."

# Dockerfile name
DOCKERFILE="Dockerfile"

# Allow public access?
# true  = anyone can access the Cloud Run URL
# false = requires authentication
ALLOW_UNAUTHENTICATED="true"

# Optional: service account for Cloud Run runtime identity.
# Leave empty if you want to use the default Compute service account.
# Example:
# SERVICE_ACCOUNT="my-app-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com"
SERVICE_ACCOUNT=""

# Optional: Cloud Run port.
# Your app should listen on this port inside the container.
PORT="8000"

# ============================================================
# DO NOT CHANGE BELOW UNLESS NEEDED
# ============================================================

IMAGE_URI="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/${IMAGE_NAME}:${IMAGE_TAG}"

echo "============================================"
echo "Cloud Run Docker Deployment"
echo "============================================"
echo "Project ID:       ${PROJECT_ID}"
echo "Region:           ${REGION}"
echo "Repository:       ${REPO_NAME}"
echo "Service name:     ${SERVICE_NAME}"
echo "Image URI:        ${IMAGE_URI}"
echo "Docker context:   ${DOCKER_CONTEXT}"
echo "Dockerfile:       ${DOCKERFILE}"
echo "Port:             ${PORT}"
echo "Public access:    ${ALLOW_UNAUTHENTICATED}"
echo "Service account:  ${SERVICE_ACCOUNT:-default}"
echo "============================================"

# Validate required inputs
if [ "$PROJECT_ID" = "YOUR_PROJECT_ID" ] || [ -z "$PROJECT_ID" ]; then
  echo "ERROR: Please set PROJECT_ID in this script."
  exit 1
fi

if [ -z "$REGION" ] || [ -z "$REPO_NAME" ] || [ -z "$SERVICE_NAME" ] || [ -z "$IMAGE_NAME" ]; then
  echo "ERROR: REGION, REPO_NAME, SERVICE_NAME, and IMAGE_NAME are required."
  exit 1
fi

# Set active project
echo ""
echo "Setting gcloud project..."
gcloud config set project "$PROJECT_ID"

# Enable required APIs
echo ""
echo "Enabling required Google Cloud APIs..."
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Create Artifact Registry repository if it does not exist
echo ""
echo "Checking Artifact Registry repository..."

if gcloud artifacts repositories describe "$REPO_NAME" \
  --location="$REGION" >/dev/null 2>&1; then
  echo "Artifact Registry repository already exists: $REPO_NAME"
else
  echo "Creating Artifact Registry repository: $REPO_NAME"
  gcloud artifacts repositories create "$REPO_NAME" \
    --repository-format=docker \
    --location="$REGION" \
    --description="Docker repository for Cloud Run apps"
fi

# Configure Docker authentication for Artifact Registry
echo ""
echo "Configuring Docker authentication..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# Build Docker image
echo ""
echo "Building Docker image..."
docker build \
  -f "$DOCKERFILE" \
  -t "$IMAGE_URI" \
  "$DOCKER_CONTEXT"

# Push Docker image
echo ""
echo "Pushing Docker image to Artifact Registry..."
docker push "$IMAGE_URI"

# Build Cloud Run deploy command
DEPLOY_CMD=(
  gcloud run deploy "$SERVICE_NAME"
  --image "$IMAGE_URI"
  --region "$REGION"
  --platform managed
  --port "$PORT"
)

if [ "$ALLOW_UNAUTHENTICATED" = "true" ]; then
  DEPLOY_CMD+=(--allow-unauthenticated)
else
  DEPLOY_CMD+=(--no-allow-unauthenticated)
fi

if [ -n "$SERVICE_ACCOUNT" ]; then
  DEPLOY_CMD+=(--service-account "$SERVICE_ACCOUNT")
fi

# Deploy to Cloud Run
echo ""
echo "Deploying to Cloud Run..."
"${DEPLOY_CMD[@]}"

echo ""
echo "Deployment completed."

echo ""
echo "Cloud Run service URL:"
gcloud run services describe "$SERVICE_NAME" \
  --region "$REGION" \
  --format="value(status.url)"