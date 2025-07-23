# 🛡️ Entra Management App

A comprehensive Microsoft Entra (Azure AD) compliance management application that helps organizations evaluate, monitor, and maintain compliance with various security frameworks including NIST SP 800-53, ISO 27001, CIS, GDPR, and HIPAA.

## 📋 Features

### 🔍 **Multi-Framework Compliance Checking**
- **NIST SP 800-53 Rev 5**: Security and Privacy Controls for Federal Information Systems
- **ISO/IEC 27001:2022**: Information Security Management Systems
- **CIS Microsoft 365**: Security benchmarks for Microsoft 365
- **GDPR**: General Data Protection Regulation compliance
- **HIPAA**: Health Insurance Portability and Accountability Act

### 🎯 **Real-Time Security Control Validation**
- Live integration with Microsoft Graph API
- Automated evaluation of Entra ID configurations
- Real-time compliance scoring and status updates
- Evidence collection and audit trails

### 🔧 **Automated Remediation Guidance**
- Intelligent recommendations for failed controls
- Step-by-step remediation instructions
- One-click configuration fixes (where possible)
- Manual confirmation workflow for complex controls

### 📊 **Advanced Reporting & Analytics**
- Interactive compliance dashboards
- Exportable reports (JSON, PDF, Excel)
- Trend analysis and historical data
- Security alerts and notifications

### 👥 **Role-Based Access Control**
- Admin, Compliance Officer, and Viewer roles
- Granular permissions management
- Audit logging for all actions
- Microsoft Entra ID authentication

## 🏗️ Architecture

### Frontend (React/Next.js)
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Query for server state
- **Authentication**: Microsoft MSAL for React
- **Charts**: Chart.js with React wrapper
- **UI Components**: Headless UI with custom components

### Backend (Node.js/Express)
- **Framework**: Express.js with TypeScript
- **Authentication**: Azure MSAL Node
- **Microsoft Graph**: Integration for Entra ID data
- **Database**: PostgreSQL with connection pooling
- **Caching**: Redis for performance optimization
- **Logging**: Winston with structured logging

### Security & Compliance
- OAuth2 + OpenID Connect authentication
- JWT tokens with automatic refresh
- RBAC enforcement at API and UI layers
- Encrypted data at rest and in transit
- Comprehensive audit logging
- Azure Key Vault integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- PostgreSQL 13+
- Redis 6+
- Microsoft Azure subscription
- Entra ID tenant with appropriate permissions

### 1. Clone and Install
```bash
git clone <repository-url>
cd <project-directory>
npm run setup
```

### 2. Azure App Registration
1. Go to Azure Portal → Entra ID → App registrations
2. Create new registration:
   - Name: "Entra Management App"
   - Redirect URI: `http://localhost:3001/auth/callback`
3. Configure API permissions:
   - Microsoft Graph: `Directory.Read.All`, `Policy.Read.All`, `AuditLog.Read.All`
4. Generate client secret
5. Note down Application (client) ID, Directory (tenant) ID, and client secret

### 3. Environment Configuration

**Backend (.env in apps/entra-api/)**
```bash
# Azure/Entra ID Configuration
AZURE_CLIENT_ID=your_client_id
AZURE_CLIENT_SECRET=your_client_secret
AZURE_TENANT_ID=your_tenant_id
AZURE_REDIRECT_URI=http://localhost:3001/auth/callback

# Database & Cache
DATABASE_URL=postgresql://username:password@localhost:5432/entra_management
REDIS_URL=redis://localhost:6379

# Application
PORT=3002
NODE_ENV=development
JWT_SECRET=your_secure_jwt_secret
```

**Frontend (.env.local in apps/entra-management/)**
```bash
NEXT_PUBLIC_API_URL=http://localhost:3002
NEXT_PUBLIC_AZURE_CLIENT_ID=your_client_id
NEXT_PUBLIC_AZURE_TENANT_ID=your_tenant_id
NEXT_PUBLIC_AZURE_REDIRECT_URI=http://localhost:3001/auth/callback
```

### 4. Start Development Servers
```bash
# Start both backend and frontend
npm run dev:entra-api    # Backend API (port 3002)
npm run dev:entra-web    # Frontend App (port 3001)

# Or start everything at once
npm run dev
```

### 5. Access the Application
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3002
- **Health Check**: http://localhost:3002/health

## 📖 Usage Guide

### Initial Setup
1. **Login**: Use your Microsoft Entra ID credentials
2. **Framework Selection**: Choose compliance frameworks to evaluate
3. **Run Assessment**: Execute compliance evaluation
4. **Review Results**: Analyze control statuses and recommendations
5. **Take Action**: Confirm controls or implement remediation

### Dashboard Overview
- **Compliance Score**: Overall percentage across all frameworks
- **Control Status**: Breakdown of passed, failed, and pending controls
- **Recent Activity**: Timeline of evaluations and changes
- **Security Alerts**: High-priority compliance issues
- **Quick Actions**: One-click access to common tasks

### Compliance Evaluation Process
1. **Framework Selection**: Multi-select from available frameworks
2. **Automated Assessment**: Real-time evaluation against Entra ID configuration
3. **Control Mapping**: Each framework control mapped to specific Entra settings
4. **Evidence Collection**: Automatic gathering of configuration evidence
5. **Scoring**: Intelligent scoring based on control implementation
6. **Recommendations**: Actionable guidance for failed controls

### Control Status Types
- **✅ Passed**: Control fully implemented and compliant
- **❌ Failed**: Control not implemented or misconfigured
- **⏱️ Not Configured**: Control settings not found or not applicable
- **⚠️ Manual Review**: Requires human verification or complex assessment

## 🔧 Configuration

### Framework Customization
Edit `apps/entra-api/src/config/frameworks.json` to:
- Add custom frameworks
- Modify control mappings
- Update evaluation criteria
- Add new control families

### Control Mapping
Each control maps to specific Entra ID configurations:
- **Conditional Access**: Policies and rules
- **MFA Settings**: Authentication methods and enforcement
- **Password Policies**: Complexity and lifecycle rules
- **User Risk Policies**: Identity protection settings
- **Audit Logs**: Logging and monitoring configuration

## 📊 API Documentation

### Authentication Endpoints
- `GET /api/auth/login-url` - Get Azure AD login URL
- `POST /api/auth/callback` - Handle OAuth callback
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/me` - Get current user info

### Compliance Endpoints
- `GET /api/compliance/frameworks` - List available frameworks
- `POST /api/compliance/evaluate/{frameworkId}` - Evaluate framework
- `POST /api/compliance/summary` - Multi-framework summary
- `POST /api/compliance/controls/{frameworkId}/{controlId}/confirm` - Confirm control

### Dashboard Endpoints
- `GET /api/dashboard/overview` - Dashboard summary
- `GET /api/dashboard/trends` - Compliance trends
- `GET /api/dashboard/recommendations` - Top recommendations

## 🛠️ Development

### Project Structure
```
apps/
├── entra-api/           # Backend API
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Express middleware
│   │   ├── config/      # Framework configurations
│   │   └── utils/       # Utility functions
│   └── package.json
├── entra-management/    # Frontend App
│   ├── src/
│   │   ├── pages/       # Next.js pages
│   │   ├── components/  # React components
│   │   ├── lib/         # Utilities and hooks
│   │   └── styles/      # CSS and styling
│   └── package.json
```

### Adding New Frameworks
1. Update `frameworks.json` with framework definition
2. Add control mappings to Entra ID settings
3. Implement evaluation logic in `ComplianceService`
4. Update frontend framework selector
5. Test evaluation and scoring

### Custom Control Mappings
```json
{
  "id": "custom-control",
  "name": "Custom Security Control",
  "description": "Custom control description",
  "family": "Access Control",
  "priority": "high",
  "mappings": {
    "entra": ["conditionalAccess", "mfaSettings"]
  }
}
```

## 🔒 Security Considerations

### Authentication & Authorization
- OAuth2/OpenID Connect with Microsoft Entra ID
- JWT tokens with secure signing and validation
- Role-based access control (RBAC)
- Token refresh and automatic expiration

### Data Protection
- All API communications over HTTPS
- Sensitive data encrypted at rest
- Audit logging for compliance tracking
- No storage of Microsoft credentials

### Permissions Required
- **Directory.Read.All**: Read directory data
- **Policy.Read.All**: Read security policies
- **AuditLog.Read.All**: Read audit logs
- **User.Read**: Read user profile

## 📈 Monitoring & Logging

### Application Monitoring
- Structured logging with Winston
- Application Insights integration
- Performance metrics and alerts
- Error tracking and reporting

### Audit Trail
- All user actions logged
- Control confirmations tracked
- Configuration changes recorded
- Compliance evaluation history

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow security guidelines
- Maintain backward compatibility

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [Microsoft Graph API Documentation](https://docs.microsoft.com/en-us/graph/)
- [Azure AD Authentication](https://docs.microsoft.com/en-us/azure/active-directory/)
- [Compliance Frameworks Guide](./docs/frameworks.md)

### Troubleshooting
- [Common Issues](./docs/troubleshooting.md)
- [Configuration Guide](./docs/configuration.md)
- [API Reference](./docs/api.md)

### Contact
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@your-domain.com

---

**Built with ❤️ for Microsoft Entra ID compliance management**