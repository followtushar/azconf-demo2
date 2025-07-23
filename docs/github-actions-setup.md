# GitHub Actions Setup for Azure Deployment

This guide explains how to set up GitHub Actions workflows to deploy the TimeCap application to Azure.

## Prerequisites

- Azure subscription with appropriate permissions
- GitHub repository with admin access
- Azure CLI installed locally (for initial setup)

## Azure Service Principal Setup

### 1. Create Azure Service Principal

```bash
# Login to Azure
az login

# Set your subscription (replace with your subscription ID)
az account set --subscription "your-subscription-id"

# Create service principal
az ad sp create-for-rbac \
  --name "timecap-github-actions" \
  --role contributor \
  --scopes /subscriptions/your-subscription-id \
  --sdk-auth
```

This will output JSON credentials. **Save this output securely** - you'll need it for GitHub secrets.

### 2. Additional Role Assignments

The service principal needs additional permissions for Key Vault and other services:

```bash
# Get the service principal object ID
SP_ID=$(az ad sp list --display-name "timecap-github-actions" --query "[0].id" -o tsv)

# Assign Key Vault Administrator role
az role assignment create \
  --assignee $SP_ID \
  --role "Key Vault Administrator" \
  --scope /subscriptions/your-subscription-id

# Assign Storage Blob Data Contributor role
az role assignment create \
  --assignee $SP_ID \
  --role "Storage Blob Data Contributor" \
  --scope /subscriptions/your-subscription-id

# Assign User Access Administrator role (for managed identity assignments)
az role assignment create \
  --assignee $SP_ID \
  --role "User Access Administrator" \
  --scope /subscriptions/your-subscription-id
```

## GitHub Repository Setup

### 1. Repository Secrets

Add the following secrets to your GitHub repository (Settings → Secrets and variables → Actions):

#### Required Secrets

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `AZURE_CREDENTIALS` | Service principal JSON from step 1 | `{"clientId": "...", "clientSecret": "...", ...}` |
| `AZURE_SUBSCRIPTION_ID` | Your Azure subscription ID | `12345678-1234-1234-1234-123456789012` |

#### Optional Secrets

| Secret Name | Description | When Needed |
|-------------|-------------|-------------|
| `SNYK_TOKEN` | Snyk security scanning token | For security scans |
| `SLACK_WEBHOOK_URL` | Slack webhook for notifications | For Slack notifications |

### 2. Repository Variables

Add these variables (Settings → Secrets and variables → Actions → Variables):

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `AZURE_LOCATION` | Default Azure region | `eastus` |
| `APP_NAME_PREFIX` | Application name prefix | `timecap` |

### 3. Environment Setup

Create the following environments in your repository (Settings → Environments):

#### Development Environment
- **Name:** `development`
- **Protection rules:** None (auto-deploy)
- **Environment secrets:** None additional

#### Production Environment
- **Name:** `production`
- **Protection rules:**
  - Required reviewers (1-2 team members)
  - Wait timer: 5 minutes
  - Deployment branches: `main` only
- **Environment secrets:** None additional

## Workflow Configuration

### 1. Workflow Files Overview

The repository includes these workflow files:

```
.github/workflows/
├── ci.yml                    # Continuous Integration
├── deploy-dev.yml           # Development Deployment  
├── deploy-prod.yml          # Production Deployment
└── destroy-infrastructure.yml # Infrastructure Cleanup
```

### 2. Workflow Triggers

#### CI Workflow (`ci.yml`)
- **Triggers:** Push to `main`/`develop`, Pull Requests
- **Purpose:** Run tests, security scans, build artifacts
- **Outputs:** Build artifacts, test results, security reports

#### Development Deployment (`deploy-dev.yml`)
- **Triggers:** Push to `develop` branch
- **Purpose:** Auto-deploy to development environment
- **Environment:** `development`

#### Production Deployment (`deploy-prod.yml`)
- **Triggers:** 
  - Push to `main` branch
  - Git tags (`v*`)
  - Manual dispatch
- **Purpose:** Deploy to production with approvals
- **Environment:** `production`
- **Features:**
  - Full test suite
  - Security scanning
  - Blue-green deployment with staging slots
  - Automated rollback on failure

#### Infrastructure Cleanup (`destroy-infrastructure.yml`)
- **Triggers:** Manual dispatch only
- **Purpose:** Safely destroy environments
- **Safety:** Requires typing "DESTROY" to confirm

## Deployment Process

### Development Deployment

1. **Automatic Trigger:** Push to `develop` branch
2. **Process:**
   - Deploy Azure infrastructure
   - Deploy API service
   - Deploy web application
   - Run health checks
3. **Duration:** ~10-15 minutes
4. **Approval:** None required

### Production Deployment

1. **Trigger Options:**
   - Push to `main` branch
   - Create git tag (`git tag v1.0.0 && git push origin v1.0.0`)
   - Manual dispatch from GitHub Actions

2. **Process:**
   - Pre-deployment checks
   - Full test suite (unit, integration, E2E)
   - Security scanning
   - **Manual approval required** (production environment)
   - Infrastructure deployment
   - Database backup
   - Blue-green deployment to staging slots
   - Health checks and smoke tests
   - Automatic slot swap to production
   - Post-deployment verification

3. **Duration:** ~25-35 minutes (including approval wait time)

## Manual Deployment

### Using GitHub Actions UI

1. Go to **Actions** tab in your repository
2. Select the workflow you want to run
3. Click **Run workflow**
4. Fill in required parameters
5. Click **Run workflow**

### Using GitHub CLI

```bash
# Deploy to development
gh workflow run "Deploy to Development" --ref develop

# Deploy to production with specific version
gh workflow run "Deploy to Production" \
  --ref main \
  --field version=v1.2.3 \
  --field skip_tests=false

# Destroy development environment
gh workflow run "Destroy Infrastructure" \
  --ref main \
  --field environment=dev \
  --field confirm_destroy=DESTROY \
  --field backup_data=true
```

## Monitoring and Troubleshooting

### 1. Workflow Status

Monitor deployments in several ways:

- **GitHub Actions UI:** Real-time logs and status
- **Azure Portal:** Resource deployment status
- **Application Insights:** Application health and performance

### 2. Common Issues

#### Authentication Failures
```
Error: AADSTS7000215: Invalid client secret is provided
```
**Solution:** Regenerate service principal credentials and update `AZURE_CREDENTIALS` secret.

#### Resource Group Already Exists
```
Error: Resource group 'timecap-rg-dev' already exists
```
**Solution:** This is usually safe to ignore. The workflow handles existing resource groups.

#### Deployment Timeout
```
Error: The deployment operation timed out
```
**Solutions:**
- Check Azure portal for actual deployment status
- Large resource deployments can take 15-20 minutes
- Re-run the workflow if it was a temporary issue

#### Health Check Failures
```
Error: API health check failed
```
**Solutions:**
- Check Application Insights for application errors
- Verify environment variables are set correctly
- Check if database migrations completed successfully

### 3. Debugging Steps

1. **Check Workflow Logs:**
   - Go to Actions tab → Select failed workflow
   - Expand failed steps to see detailed logs

2. **Verify Azure Resources:**
   ```bash
   # Check resource group status
   az group show --name timecap-rg-dev
   
   # List all resources
   az resource list --resource-group timecap-rg-dev --output table
   
   # Check App Service logs
   az webapp log tail --resource-group timecap-rg-dev --name timecap-dev-api
   ```

3. **Check Application Health:**
   ```bash
   # Test API health
   curl https://timecap-dev-api.azurewebsites.net/health
   
   # Test web app
   curl https://timecap-dev-web.azurewebsites.net/
   ```

## Security Best Practices

### 1. Secret Management

- **Rotate secrets regularly** (every 90 days)
- **Use least-privilege permissions** for service principal
- **Never commit secrets** to repository
- **Use Azure Key Vault** for application secrets

### 2. Environment Isolation

- **Separate subscriptions** for production (recommended)
- **Different resource groups** per environment
- **Environment-specific service principals** (advanced)

### 3. Access Control

- **Require approvals** for production deployments
- **Limit who can create/modify workflows**
- **Use branch protection rules**
- **Enable security scanning**

## Cost Management

### 1. Development Environment

- **Auto-shutdown:** Consider using Azure DevTest Labs
- **Smaller SKUs:** Use Basic/Standard tiers for dev
- **Cleanup:** Regularly destroy unused environments

### 2. Production Environment

- **Reserved Instances:** Use for predictable workloads
- **Auto-scaling:** Configure based on usage patterns
- **Monitoring:** Set up cost alerts

### 3. Cleanup Script

```bash
# List all TimeCap resource groups
az group list --query "[?starts_with(name, 'timecap-rg')].name" -o table

# Delete development environment
az group delete --name timecap-rg-dev --yes --no-wait
```

## Advanced Configuration

### 1. Multi-region Deployment

For high availability, you can extend the workflows to deploy to multiple regions:

```yaml
strategy:
  matrix:
    region: [eastus, westus2, northeurope]
```

### 2. Database Migrations

The workflows include database migration steps. For complex migrations:

1. **Test migrations** in development first
2. **Backup production** before migration
3. **Use migration rollback** scripts if needed

### 3. Blue-Green Deployment

Production deployments use staging slots for zero-downtime deployments:

1. Deploy to staging slot
2. Warm up staging slot
3. Run health checks
4. Swap slots (instant)
5. Monitor production

### 4. Custom Notifications

Add custom notifications to workflows:

```yaml
- name: Notify Slack
  if: always()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## Troubleshooting Checklist

When deployments fail, check these items in order:

1. **GitHub Secrets:**
   - [ ] `AZURE_CREDENTIALS` is valid and not expired
   - [ ] `AZURE_SUBSCRIPTION_ID` is correct
   - [ ] Service principal has required permissions

2. **Azure Resources:**
   - [ ] Subscription has sufficient quota
   - [ ] Resource names are globally unique
   - [ ] Region supports all required services

3. **Application Code:**
   - [ ] All tests pass locally
   - [ ] Build succeeds locally
   - [ ] Environment variables are configured

4. **Network and Dependencies:**
   - [ ] External services are accessible
   - [ ] Database connection strings are correct
   - [ ] Storage accounts are accessible

## Support and Maintenance

### Regular Maintenance Tasks

1. **Monthly:**
   - Review and rotate secrets
   - Update workflow dependencies
   - Check for security updates

2. **Quarterly:**
   - Review resource costs
   - Update Azure service SKUs if needed
   - Test disaster recovery procedures

3. **Annually:**
   - Review and update security policies
   - Conduct deployment process review
   - Update documentation

### Getting Help

- **GitHub Issues:** Use the deployment issue template
- **Azure Support:** For Azure-specific issues
- **Team Documentation:** Internal runbooks and procedures

This completes the GitHub Actions setup for Azure deployment. The workflows provide a robust, secure, and automated deployment pipeline for the TimeCap application.