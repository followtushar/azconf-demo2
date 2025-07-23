#!/bin/bash

# TimeCap Azure Deployment Script
# This script deploys the TimeCap application to Azure using Bicep templates

set -e

# Configuration
RESOURCE_GROUP_NAME="timecap-rg"
LOCATION="eastus"
ENVIRONMENT="dev"
SUBSCRIPTION_ID=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -g|--resource-group)
            RESOURCE_GROUP_NAME="$2"
            shift 2
            ;;
        -l|--location)
            LOCATION="$2"
            shift 2
            ;;
        -s|--subscription)
            SUBSCRIPTION_ID="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -e, --environment    Environment (dev, staging, prod) [default: dev]"
            echo "  -g, --resource-group Resource group name [default: timecap-rg]"
            echo "  -l, --location       Azure location [default: eastus]"
            echo "  -s, --subscription   Azure subscription ID"
            echo "  -h, --help          Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Update resource group name with environment
RESOURCE_GROUP_NAME="${RESOURCE_GROUP_NAME}-${ENVIRONMENT}"

log_info "Starting TimeCap deployment to Azure..."
log_info "Environment: ${ENVIRONMENT}"
log_info "Resource Group: ${RESOURCE_GROUP_NAME}"
log_info "Location: ${LOCATION}"

# Check prerequisites
log_info "Checking prerequisites..."

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    log_error "Azure CLI is not installed. Please install it first."
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    log_error "Not logged in to Azure. Please run 'az login' first."
    exit 1
fi

# Set subscription if provided
if [ -n "$SUBSCRIPTION_ID" ]; then
    log_info "Setting Azure subscription to $SUBSCRIPTION_ID"
    az account set --subscription "$SUBSCRIPTION_ID"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    log_error "Node.js is not installed. Please install it first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    log_error "npm is not installed. Please install it first."
    exit 1
fi

log_success "Prerequisites check passed!"

# Generate secure passwords
log_info "Generating secure credentials..."
POSTGRES_ADMIN_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
JWT_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
ENCRYPTION_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)

# Create resource group
log_info "Creating resource group: $RESOURCE_GROUP_NAME"
az group create \
    --name "$RESOURCE_GROUP_NAME" \
    --location "$LOCATION" \
    --tags Environment="$ENVIRONMENT" Application="TimeCap"

log_success "Resource group created successfully!"

# Deploy Azure infrastructure
log_info "Deploying Azure infrastructure..."
DEPLOYMENT_NAME="timecap-infrastructure-$(date +%Y%m%d-%H%M%S)"

az deployment group create \
    --resource-group "$RESOURCE_GROUP_NAME" \
    --template-file main.bicep \
    --name "$DEPLOYMENT_NAME" \
    --parameters \
        environment="$ENVIRONMENT" \
        postgresAdminUsername="timecap_admin" \
        postgresAdminPassword="$POSTGRES_ADMIN_PASSWORD" \
    --verbose

if [ $? -eq 0 ]; then
    log_success "Azure infrastructure deployed successfully!"
else
    log_error "Failed to deploy Azure infrastructure"
    exit 1
fi

# Get deployment outputs
log_info "Retrieving deployment outputs..."
DEPLOYMENT_OUTPUTS=$(az deployment group show \
    --resource-group "$RESOURCE_GROUP_NAME" \
    --name "$DEPLOYMENT_NAME" \
    --query properties.outputs \
    --output json)

API_APP_NAME=$(echo "$DEPLOYMENT_OUTPUTS" | jq -r '.apiAppServiceName.value')
WEB_APP_NAME=$(echo "$DEPLOYMENT_OUTPUTS" | jq -r '.webAppServiceName.value')
API_URL=$(echo "$DEPLOYMENT_OUTPUTS" | jq -r '.apiUrl.value')
WEB_URL=$(echo "$DEPLOYMENT_OUTPUTS" | jq -r '.webUrl.value')
POSTGRES_CONNECTION_STRING=$(echo "$DEPLOYMENT_OUTPUTS" | jq -r '.postgresConnectionString.value')
STORAGE_ACCOUNT_NAME=$(echo "$DEPLOYMENT_OUTPUTS" | jq -r '.storageAccountName.value')
CDN_ENDPOINT_URL=$(echo "$DEPLOYMENT_OUTPUTS" | jq -r '.cdnEndpointUrl.value')
KEY_VAULT_NAME=$(echo "$DEPLOYMENT_OUTPUTS" | jq -r '.keyVaultName.value')

log_info "API App Service: $API_APP_NAME"
log_info "Web App Service: $WEB_APP_NAME"
log_info "API URL: $API_URL"
log_info "Web URL: $WEB_URL"

# Store secrets in Key Vault
log_info "Storing secrets in Azure Key Vault..."
az keyvault secret set --vault-name "$KEY_VAULT_NAME" --name "jwt-secret" --value "$JWT_SECRET" > /dev/null
az keyvault secret set --vault-name "$KEY_VAULT_NAME" --name "encryption-key" --value "$ENCRYPTION_KEY" > /dev/null
az keyvault secret set --vault-name "$KEY_VAULT_NAME" --name "postgres-password" --value "$POSTGRES_ADMIN_PASSWORD" > /dev/null

log_success "Secrets stored in Key Vault!"

# Build the application
log_info "Building the application..."

# Install dependencies
npm install

# Build API
log_info "Building API..."
cd apps/api
npm run build
cd ../..

# Build Web app
log_info "Building Web app..."
cd apps/web
npm run build
cd ../..

log_success "Application built successfully!"

# Create deployment packages
log_info "Creating deployment packages..."

# Create API deployment package
cd apps/api
zip -r ../../api-deployment.zip . -x "node_modules/*" "src/*" "*.ts" "tsconfig.json"
cd ../..

# Create Web deployment package
cd apps/web
zip -r ../../web-deployment.zip dist/*
cd ../..

log_success "Deployment packages created!"

# Deploy API to App Service
log_info "Deploying API to App Service..."
az webapp deployment source config-zip \
    --resource-group "$RESOURCE_GROUP_NAME" \
    --name "$API_APP_NAME" \
    --src api-deployment.zip

if [ $? -eq 0 ]; then
    log_success "API deployed successfully!"
else
    log_error "Failed to deploy API"
    exit 1
fi

# Deploy Web app to App Service
log_info "Deploying Web app to App Service..."
az webapp deployment source config-zip \
    --resource-group "$RESOURCE_GROUP_NAME" \
    --name "$WEB_APP_NAME" \
    --src web-deployment.zip

if [ $? -eq 0 ]; then
    log_success "Web app deployed successfully!"
else
    log_error "Failed to deploy Web app"
    exit 1
fi

# Configure App Service settings
log_info "Configuring App Service settings..."

# Get storage account connection string
STORAGE_CONNECTION_STRING=$(az storage account show-connection-string \
    --resource-group "$RESOURCE_GROUP_NAME" \
    --name "$STORAGE_ACCOUNT_NAME" \
    --query connectionString \
    --output tsv)

# Configure API App Service settings
az webapp config appsettings set \
    --resource-group "$RESOURCE_GROUP_NAME" \
    --name "$API_APP_NAME" \
    --settings \
        NODE_ENV="$ENVIRONMENT" \
        DATABASE_URL="$POSTGRES_CONNECTION_STRING" \
        AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION_STRING" \
        JWT_SECRET="$JWT_SECRET" \
        ENCRYPTION_KEY="$ENCRYPTION_KEY" \
        WEB_URL="$WEB_URL" \
        API_URL="$API_URL" > /dev/null

# Configure Web App Service settings
az webapp config appsettings set \
    --resource-group "$RESOURCE_GROUP_NAME" \
    --name "$WEB_APP_NAME" \
    --settings \
        NODE_ENV="$ENVIRONMENT" \
        API_URL="$API_URL" > /dev/null

log_success "App Service settings configured!"

# Run database migrations
log_info "Running database migrations..."
az webapp ssh --resource-group "$RESOURCE_GROUP_NAME" --name "$API_APP_NAME" --command "cd /home/site/wwwroot && npm run db:deploy"

log_success "Database migrations completed!"

# Cleanup deployment files
log_info "Cleaning up deployment files..."
rm -f api-deployment.zip web-deployment.zip

# Health check
log_info "Performing health checks..."
sleep 30  # Wait for services to start

# Check API health
if curl -f "$API_URL/health" > /dev/null 2>&1; then
    log_success "API health check passed!"
else
    log_warning "API health check failed. The service might still be starting up."
fi

# Check Web app
if curl -f "$WEB_URL" > /dev/null 2>&1; then
    log_success "Web app health check passed!"
else
    log_warning "Web app health check failed. The service might still be starting up."
fi

# Display deployment summary
echo ""
echo "========================================"
echo "         DEPLOYMENT SUMMARY"
echo "========================================"
echo "Environment: $ENVIRONMENT"
echo "Resource Group: $RESOURCE_GROUP_NAME"
echo "Location: $LOCATION"
echo ""
echo "Application URLs:"
echo "  Web App: $WEB_URL"
echo "  API: $API_URL"
echo ""
echo "Azure Resources:"
echo "  API App Service: $API_APP_NAME"
echo "  Web App Service: $WEB_APP_NAME"
echo "  Storage Account: $STORAGE_ACCOUNT_NAME"
echo "  Key Vault: $KEY_VAULT_NAME"
echo "  CDN Endpoint: $CDN_ENDPOINT_URL"
echo ""
echo "Next Steps:"
echo "1. Configure custom domain (if needed)"
echo "2. Set up SSL certificates"
echo "3. Configure monitoring alerts"
echo "4. Set up backup policies"
echo "5. Configure Azure AD authentication"
echo ""
log_success "TimeCap deployment completed successfully!"
echo "========================================"