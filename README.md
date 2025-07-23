# TimeCap - Time Capsule App 🕰️

A modern time capsule application that allows users to record and schedule audio/video messages for future delivery to loved ones or themselves. Built with Azure cloud services for enterprise-grade scalability and security.

## 🎯 Features

- **Record & Schedule**: Record audio/video messages and schedule them for future delivery
- **Multi-recipient Support**: Send to yourself or others via email/SMS/push notifications
- **Privacy Controls**: Public, private, or recipient-only sharing options
- **Message Management**: View, edit, and cancel upcoming capsules
- **Smart Notifications**: Push, email, and SMS alerts when capsules open
- **Media Support**: In-app recording and file uploads with attachments
- **Security**: End-to-end encryption and secure authentication
- **Legacy Management**: Designate contacts for inactive user scenarios

## 🏗️ Architecture

### Frontend
- **Web**: React with TypeScript, Vite, and Tailwind CSS
- **Mobile**: React Native (iOS/Android support)

### Backend
- **API**: Node.js with Express and TypeScript
- **Database**: Azure Database for PostgreSQL with Prisma ORM
- **Storage**: Azure Blob Storage for media files with CDN
- **Queue**: Azure Service Bus for job scheduling
- **Auth**: JWT with Azure AD and social login support

### Azure Services
- **App Service**: Web and API hosting
- **Azure Database for PostgreSQL**: Primary database
- **Azure Cache for Redis**: Caching and session storage
- **Azure Blob Storage**: Media file storage
- **Azure CDN**: Content delivery network
- **Azure Communication Services**: Email and SMS
- **Azure Service Bus**: Message queuing
- **Azure Key Vault**: Secrets management
- **Application Insights**: Monitoring and analytics
- **Azure Notification Hubs**: Push notifications

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Azure CLI
- Docker and Docker Compose
- Azure subscription (for production)

### Development Setup

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd timecap
   npm run setup  # Installs all dependencies
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development Environment**
   ```bash
   npm run dev  # Starts all services with hot reload
   ```

4. **Access the Application**
   - Web App: http://localhost:3000
   - API: http://localhost:8000
   - Admin Panel: http://localhost:3001

### Production Deployment

```bash
npm run build
npm run deploy
```

## 📱 Mobile Development

```bash
cd mobile
npm install
npm run ios     # iOS simulator
npm run android # Android emulator
```

## 🧪 Testing

```bash
npm run test        # Run all tests
npm run test:unit   # Unit tests only
npm run test:e2e    # End-to-end tests
```

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [Frontend Guide](./docs/frontend.md)
- [Mobile Development](./docs/mobile.md)
- [Deployment Guide](./docs/deployment.md)
- [Security & Privacy](./docs/security.md)

## 🔒 Security & Privacy

- End-to-end encryption for all messages
- GDPR and CCPA compliant
- Secure authentication with MFA support
- Data retention and deletion policies
- Regular security audits

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 🆘 Support

- [Documentation](./docs/)
- [Issues](https://github.com/your-org/timecap/issues)
- [Discussions](https://github.com/your-org/timecap/discussions) 