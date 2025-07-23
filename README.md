# TimeCap - Time Capsule App 🕰️

A modern time capsule application that allows users to record and schedule audio/video messages for future delivery to loved ones or themselves.

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
- **Database**: PostgreSQL with Prisma ORM
- **Storage**: AWS S3 compatible storage for media files
- **Queue**: Redis for job scheduling and caching
- **Auth**: JWT with social login support

### Infrastructure
- **Containerized**: Docker for development and deployment
- **Cloud Ready**: Supports AWS, Azure, and GCP deployment
- **Monitoring**: Health checks and logging

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (or use Docker)
- Redis (or use Docker)

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