# TimeCap - Time Capsule Application 🎯

A comprehensive time capsule application that allows users to record and schedule audio/video messages for future delivery to themselves or loved ones.

## 🌟 Features

### Core Functionality
- **Record & Schedule**: Record audio/video messages and schedule delivery from 1 hour to decades in the future
- **Multi-recipient Support**: Send to yourself or others via email/SMS/push notifications
- **Privacy Controls**: Public, private, or recipient-only sharing options
- **Message Management**: View, edit, or cancel scheduled capsules
- **Smart Notifications**: Push, email, and SMS notifications with pre-delivery reminders
- **Media Support**: In-app recording, file uploads, text and photo attachments

### Security & Privacy
- **End-to-end Encryption**: All messages encrypted in transit and at rest
- **Secure Authentication**: Email + social login with optional MFA
- **Legacy Management**: Designate contacts to receive capsules if user becomes inactive
- **GDPR Compliance**: Data retention policies and user consent management

### User Experience
- **Cross-platform**: Web and mobile (React Native) applications
- **Intuitive UI**: Clear scheduling flow with calendar and timeline views
- **Accessibility**: Subtitles, captions, and large text support
- **Progressive Countdown**: Visual indicators for upcoming capsule deliveries

## 🏗️ Architecture

```
timecap-app/
├── frontend/           # React web application
├── mobile/            # React Native mobile app
├── backend/           # Node.js/Express API server
├── services/          # Microservices (media, scheduling, notifications)
├── infrastructure/    # Docker, Kubernetes, and cloud configs
├── shared/           # Shared types, utilities, and constants
└── docs/             # Documentation and API specs
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 6+
- AWS CLI (for S3 media storage)

### Installation

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd timecap-app
   npm install
   ```

2. **Environment setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development environment**:
   ```bash
   docker-compose up -d  # Start databases
   npm run dev          # Start all services
   ```

4. **Access applications**:
   - Web App: http://localhost:3000
   - API Server: http://localhost:8000
   - Admin Dashboard: http://localhost:3001

## 🔧 Development

### Available Scripts
- `npm run dev` - Start all services in development mode
- `npm run build` - Build all applications for production
- `npm run test` - Run test suites
- `npm run lint` - Run ESLint across all packages
- `npm run deploy` - Deploy to staging/production

### Tech Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Mobile**: React Native, Expo
- **Backend**: Node.js, Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL, Redis
- **Media**: AWS S3, FFmpeg for processing
- **Authentication**: Auth0 / Firebase Auth
- **Notifications**: SendGrid (email), Twilio (SMS), Firebase (push)
- **Infrastructure**: Docker, Kubernetes, AWS/Azure

## 📱 Mobile App

The React Native mobile app provides the full TimeCap experience with:
- Native camera and microphone access
- Offline message composition
- Push notifications
- Biometric authentication
- Background upload capabilities

## 🔒 Security

- **Encryption**: AES-256 encryption for all stored media
- **Authentication**: JWT tokens with refresh mechanism
- **Authorization**: Role-based access control (RBAC)
- **Data Privacy**: GDPR-compliant data handling
- **Audit Logging**: Comprehensive security event logging

## 📊 Monitoring & Analytics

- **Application Monitoring**: Health checks, performance metrics
- **User Analytics**: Capsule creation/delivery rates, engagement metrics
- **Error Tracking**: Comprehensive error logging and alerting
- **Business Metrics**: User retention, feature usage, delivery success rates

## 🌍 Deployment

### Production Deployment
- **Cloud Provider**: AWS/Azure with multi-region support
- **Container Orchestration**: Kubernetes with auto-scaling
- **CDN**: CloudFront/Azure CDN for media delivery
- **Database**: Managed PostgreSQL with read replicas
- **Monitoring**: CloudWatch/Azure Monitor + custom dashboards

### Scaling Considerations
- **Media Storage**: S3 with lifecycle policies for cost optimization
- **Job Processing**: Redis-based queue with horizontal scaling
- **Database**: Read replicas and connection pooling
- **Caching**: Redis for session and frequently accessed data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

- **Documentation**: [docs.timecap.app](https://docs.timecap.app)
- **Issues**: GitHub Issues
- **Email**: support@timecap.app
- **Discord**: [TimeCap Community](https://discord.gg/timecap)