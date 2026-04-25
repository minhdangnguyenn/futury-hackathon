#!/usr/bin/env bash

set -euo pipefail

# ============================================================
# Inputs to change
# ============================================================

PROJECT_ID="futury-accel26fra-513"
REGION="europe-west1"
SERVICE_NAME="freiessen"

# Source folder that contains the Dockerfile for this app.
SOURCE_DIR="."

# Runtime environment variables passed to Cloud Run.
ENV_FILE=".env"

# Build-time environment variables for Docker/Next build.
# By default we reuse the same .env because Next/Payload read env during build.
BUILD_ENV_FILE=".env"

PORT="3000"
ALLOW_UNAUTHENTICATED="true"
INGRESS="all"

CPU="1"
MEMORY="1Gi"
TIMEOUT="300"
MIN_INSTANCES="0"
MAX_INSTANCES="3"

# Leave empty to use the default Compute service account.
SERVICE_ACCOUNT=""

# Optional human-readable description.
DESCRIPTION="Freiessen dashboard"

# Required env keys for this app at runtime.
REQUIRED_ENV_KEYS=("DATABASE_URL" "PAYLOAD_SECRET" "ID_TOKEN_SECRET")

# ============================================================
# Script internals
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_PATH="${SCRIPT_DIR}/${SOURCE_DIR}"
ENV_PATH="${SCRIPT_DIR}/${ENV_FILE}"

if [[ -n "${BUILD_ENV_FILE}" ]]; then
  BUILD_ENV_PATH="${SCRIPT_DIR}/${BUILD_ENV_FILE}"
else
  BUILD_ENV_PATH=""
fi

RUNTIME_ENV_YAML="$(mktemp)"
BUILD_ENV_YAML=""

cleanup() {
  rm -f "${RUNTIME_ENV_YAML}"
  if [[ -n "${BUILD_ENV_YAML}" ]]; then
    rm -f "${BUILD_ENV_YAML}"
  fi
}

trap cleanup EXIT

convert_dotenv_to_yaml() {
  local input_path="$1"
  local output_path="$2"

  : > "${output_path}"

  while IFS= read -r raw_line || [[ -n "${raw_line}" ]]; do
    local line
    local key
    local value
    local escaped_value

    line="$(printf '%s' "${raw_line}" | sed 's/\r$//')"

    if [[ "${line}" =~ ^[[:space:]]*$ ]]; then
      continue
    fi

    if [[ "${line}" =~ ^[[:space:]]*# ]]; then
      continue
    fi

    line="$(printf '%s' "${line}" | sed 's/^[[:space:]]*export[[:space:]]\+//')"

    if [[ "${line}" != *=* ]]; then
      echo "ERROR: Invalid env line in ${input_path}: ${raw_line}"
      exit 1
    fi

    key="${line%%=*}"
    value="${line#*=}"
    key="$(printf '%s' "${key}" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')"

    if [[ -z "${key}" ]]; then
      echo "ERROR: Invalid env key in ${input_path}: ${raw_line}"
      exit 1
    fi

    if [[ "${value}" =~ ^\".*\"$ ]]; then
      value="${value:1:${#value}-2}"
      value="${value//\\\"/\"}"
      value="${value//\\\\/\\}"
    elif [[ "${value}" =~ ^\'.*\'$ ]]; then
      value="${value:1:${#value}-2}"
    fi

    escaped_value="${value//\'/\'\'}"
    printf "%s: '%s'\n" "${key}" "${escaped_value}" >> "${output_path}"
  done < "${input_path}"
}

echo "============================================"
echo "Cloud Run Source Deployment"
echo "============================================"
echo "Project ID:         ${PROJECT_ID}"
echo "Region:             ${REGION}"
echo "Service name:       ${SERVICE_NAME}"
echo "Source path:        ${SOURCE_PATH}"
echo "Runtime env file:   ${ENV_PATH}"
echo "Build env file:     ${BUILD_ENV_PATH:-<none>}"
echo "Port:               ${PORT}"
echo "CPU / Memory:       ${CPU} / ${MEMORY}"
echo "Timeout:            ${TIMEOUT}s"
echo "Min / Max instances:${MIN_INSTANCES} / ${MAX_INSTANCES}"
echo "Public access:      ${ALLOW_UNAUTHENTICATED}"
echo "Ingress:            ${INGRESS}"
echo "Service account:    ${SERVICE_ACCOUNT:-default}"
echo "============================================"

if [[ "${PROJECT_ID}" == "YOUR_GCP_PROJECT_ID" || -z "${PROJECT_ID}" ]]; then
  echo "ERROR: Set PROJECT_ID at the top of freiessen/deploy.sh"
  exit 1
fi

if [[ ! -d "${SOURCE_PATH}" ]]; then
  echo "ERROR: Source path does not exist: ${SOURCE_PATH}"
  exit 1
fi

if [[ ! -f "${SOURCE_PATH}/Dockerfile" ]]; then
  echo "ERROR: Dockerfile not found in source path: ${SOURCE_PATH}"
  exit 1
fi

if [[ ! -f "${ENV_PATH}" ]]; then
  echo "ERROR: Runtime env file not found: ${ENV_PATH}"
  exit 1
fi

if [[ -n "${BUILD_ENV_PATH}" && ! -f "${BUILD_ENV_PATH}" ]]; then
  echo "ERROR: Build env file not found: ${BUILD_ENV_PATH}"
  exit 1
fi

for key in "${REQUIRED_ENV_KEYS[@]}"; do
  if ! grep -Eq "^[[:space:]]*(export[[:space:]]+)?${key}=" "${ENV_PATH}"; then
    echo "ERROR: Missing required key '${key}' in ${ENV_PATH}"
    exit 1
  fi
done

echo
echo "Checking required CLIs..."
command -v gcloud >/dev/null 2>&1 || {
  echo "ERROR: gcloud CLI is not installed."
  exit 1
}

echo
echo "Setting gcloud project..."
gcloud config set project "${PROJECT_ID}"

echo
echo "Enabling required Google Cloud APIs..."
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable artifactregistry.googleapis.com

echo
echo "Converting runtime .env to Cloud Run YAML env file..."
convert_dotenv_to_yaml "${ENV_PATH}" "${RUNTIME_ENV_YAML}"

if [[ -n "${BUILD_ENV_PATH}" ]]; then
  BUILD_ENV_YAML="$(mktemp)"
  echo "Converting build .env to Cloud Build YAML env file..."
  convert_dotenv_to_yaml "${BUILD_ENV_PATH}" "${BUILD_ENV_YAML}"
fi

DEPLOY_CMD=(
  gcloud run deploy "${SERVICE_NAME}"
  --source "${SOURCE_PATH}"
  --region "${REGION}"
  --platform managed
  --port "${PORT}"
  --cpu "${CPU}"
  --memory "${MEMORY}"
  --timeout "${TIMEOUT}"
  --min-instances "${MIN_INSTANCES}"
  --max-instances "${MAX_INSTANCES}"
  --ingress "${INGRESS}"
  --description "${DESCRIPTION}"
  --execution-environment gen2
  --env-vars-file "${RUNTIME_ENV_YAML}"
)

if [[ "${ALLOW_UNAUTHENTICATED}" == "true" ]]; then
  DEPLOY_CMD+=(--allow-unauthenticated)
else
  DEPLOY_CMD+=(--no-allow-unauthenticated)
fi

if [[ -n "${BUILD_ENV_PATH}" ]]; then
  DEPLOY_CMD+=(--build-env-vars-file "${BUILD_ENV_YAML}")
fi

if [[ -n "${SERVICE_ACCOUNT}" ]]; then
  DEPLOY_CMD+=(--service-account "${SERVICE_ACCOUNT}")
fi

echo
echo "Deploying to Cloud Run..."
"${DEPLOY_CMD[@]}"

echo
echo "Deployment completed."

echo
echo "Cloud Run service URL:"
gcloud run services describe "${SERVICE_NAME}" \
  --region "${REGION}" \
  --format="value(status.url)"
