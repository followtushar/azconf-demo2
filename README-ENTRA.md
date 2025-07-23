# 🛡️ Entra Management App

A comprehensive Microsoft Entra ID (Azure AD) compliance and security controls management application. This app helps administrators manage compliance frameworks, check security controls, and remediate misconfigurations across their Entra ID environment.

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Compliance Frameworks](#compliance-frameworks)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🔐 Authentication & Authorization
- Microsoft Entra ID (Azure AD) OAuth2 integration
- Role-based access control (Admin, Compliance Officer, Viewer)
- Secure JWT token management

### 📊 Dashboard & Analytics
- Real-time compliance score overview
- Framework coverage progress tracking
- Security alerts and recommendations
- Recent activity monitoring
- Compliance trends visualization

### 🎯 Compliance Framework Support
- **NIST SP 800-53** - National Institute of Standards and Technology
- **CIS Microsoft 365** - Center for Internet Security
- **ISO/IEC 27001** - International Organization for Standardization
- **GDPR** - General Data Protection Regulation
- **HIPAA** - Health Insurance Portability and Accountability Act
- **Custom Frameworks** - Upload via JSON/YAML

### 🔍 Control Management
- Real-time control status checking
- Automated evidence collection
- Manual confirmation capabilities
- Control mapping between frameworks
- Detailed control documentation

### 🛠️ Remediation Engine
- One-click automated remediation
- PowerShell script execution
- Manual configuration guides
- Change preview and rollback
- Risk assessment and approval workflows

### 📈 Reporting & Export
- Comprehensive compliance reports
- Multiple export formats (PDF, Excel, JSON)
- Scheduled report generation
- Audit trail documentation
- Custom report templates

### 🔔 Notifications & Alerts
- Email and Teams notifications
- Threshold-based alerting
- Weekly compliance digests
- Real-time status updates
- Customizable notification preferences

### 🔗 Integrations
- Microsoft Defender for Cloud
- Microsoft Compliance Manager
- Azure Log Analytics
- Custom API integrations

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (PostgreSQL)  │
│   Port: 3001    │    │   Port: 3002    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       
         │                       │                       
         ▼                       ▼                       
┌─────────────────┐    ┌─────────────────┐              
│   Azure AD      │    │ Microsoft Graph │              
│   (Auth)        │    │   API           │              
└─────────────────┘    └─────────────────┘              
```

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- TailwindCSS for styling
- React Query for data fetching
- React Router for navigation
- Chart.js for visualizations
- MSAL for Azure AD authentication

**Backend:**
- Node.js with Express
- TypeScript
- Prisma ORM
- PostgreSQL database
- Microsoft Graph SDK
- Socket.IO for real-time updates
- Winston for logging

**Infrastructure:**
- Azure App Services
- Azure Database for PostgreSQL
- Azure Key Vault
- Application Insights
- Azure Service Bus

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 13+
- Azure AD tenant with appropriate permissions
- Azure subscription (for deployment)

### Required Azure AD Permissions

The application requires the following Microsoft Graph API permissions:

**Application Permissions:**
- `Directory.Read.All`
- `Policy.Read.All`
- `Policy.ReadWrite.ConditionalAccess`
- `RoleManagement.Read.Directory`
- `AuditLog.Read.All`

**Delegated Permissions:**
- `User.Read`
- `Directory.Read.All`
- `Policy.Read.All`

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **Install dependencies**
   ```bash
   npm run setup
   ```

3. **Set up environment variables**
   ```bash
   # Backend API
   cp apps/entra-api/.env.example apps/entra-api/.env
   
   # Frontend Web App
   cp apps/entra-web/.env.example apps/entra-web/.env
   ```

4. **Configure database**
   ```bash
   # Update DATABASE_URL in apps/entra-api/.env
   npm run db:setup --workspace=apps/entra-api
   ```

## ⚙️ Configuration

### Azure AD App Registration

1. **Register a new application** in Azure AD
2. **Configure authentication**:
   - Platform: Single-page application
   - Redirect URI: `http://localhost:3001`
3. **Add API permissions** (see Prerequisites)
4. **Create client secret** (for backend)
5. **Update environment files** with client ID, tenant ID, and secret

### Environment Variables

**Backend (apps/entra-api/.env):**
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/entra_management"
AZURE_TENANT_ID="your-tenant-id"
AZURE_CLIENT_ID="your-client-id"
AZURE_CLIENT_SECRET="your-client-secret"
JWT_SECRET="your-jwt-secret"
```

**Frontend (apps/entra-web/.env):**
```env
VITE_AZURE_CLIENT_ID="your-client-id"
VITE_AZURE_TENANT_ID="your-tenant-id"
VITE_API_BASE_URL="http://localhost:3002/api"
```

## 🎯 Usage

### Development

Start both applications in development mode:
```bash
npm run dev:entra
```

This runs:
- Frontend at `http://localhost:3001`
- Backend API at `http://localhost:3002`

### Individual Services

```bash
# Start only the API
npm run dev:entra-api

# Start only the web app
npm run dev:entra-web
```

### Production Build

```bash
npm run build --workspaces
```

## 📚 API Documentation

### Authentication

All API endpoints require authentication via Bearer token:
```
Authorization: Bearer <jwt-token>
```

### Core Endpoints

#### Dashboard
- `GET /api/dashboard` - Get compliance summary and recent activity

#### Controls
- `GET /api/controls` - List compliance controls with filtering
- `GET /api/controls/:id` - Get specific control details
- `POST /api/controls/:id/confirm` - Manually confirm control
- `POST /api/controls/:id/remediate` - Execute remediation

#### Compliance
- `POST /api/compliance/check` - Run compliance check
- `GET /api/compliance/status/:jobId` - Check compliance job status

#### Reports
- `GET /api/reports` - List generated reports
- `POST /api/reports/generate` - Generate new report
- `GET /api/reports/:id/download` - Download report

### WebSocket Events

Real-time updates via Socket.IO:
- `compliance-status-update` - Compliance check progress
- `control-status-change` - Control status changes
- `new-alert` - Security alerts

## 🎯 Compliance Frameworks

### NIST SP 800-53

Security and Privacy Controls for Federal Information Systems and Organizations.

**Supported Control Families:**
- Access Control (AC)
- Awareness and Training (AT)
- Audit and Accountability (AU)
- Configuration Management (CM)
- Identification and Authentication (IA)
- And more...

### CIS Microsoft 365

Center for Internet Security Controls for Microsoft 365.

**Key Areas:**
- Account Management
- Application Management
- Data Management
- Email Security
- Device Management

### ISO/IEC 27001

International standard for information security management systems.

**Control Categories:**
- Information Security Policies
- Organization of Information Security
- Human Resource Security
- Asset Management
- Access Control

## 🔒 Security

### Authentication
- OAuth2 with Azure AD
- JWT tokens with configurable expiration
- Role-based access control

### Data Protection
- Encryption at rest and in transit
- Secure credential storage in Azure Key Vault
- Audit logging for all actions

### API Security
- Rate limiting
- Input validation
- CORS configuration
- Helmet.js security headers

## 📊 Monitoring

### Application Insights
- Performance monitoring
- Error tracking
- Custom telemetry
- Dependency tracking

### Logging
- Structured logging with Winston
- Multiple log levels
- Azure Application Insights integration

## 🚀 Deployment

### Azure App Services

1. **Create App Services**:
   - Frontend: Static Web App or App Service
   - Backend: App Service (Node.js)

2. **Configure environment variables** in Azure portal

3. **Set up CI/CD** with GitHub Actions:
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to Azure
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - name: Deploy to Azure
           uses: azure/webapps-deploy@v2
   ```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Use conventional commit messages
- Add JSDoc comments for functions
- Update tests for new features
- Maintain test coverage above 80%

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs via GitHub Issues
- **Email**: support@yourcompany.com

## 🗺️ Roadmap

- [ ] Mobile app support (React Native)
- [ ] Advanced analytics and ML insights
- [ ] Additional compliance frameworks
- [ ] Custom control creation
- [ ] API rate limiting dashboard
- [ ] Multi-tenant support
- [ ] Advanced reporting templates

---

**Built with ❤️ for Microsoft Entra ID compliance management**