# TimeCap Deployment Guide

This document provides comprehensive instructions for deploying the TimeCap application across different environments and platforms.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Mobile App Deployment](#mobile-app-deployment)
7. [Infrastructure as Code](#infrastructure-as-code)
8. [Monitoring and Logging](#monitoring-and-logging)
9. [Scaling Considerations](#scaling-considerations)

## Prerequisites

### Required Software
- Node.js 18+ and npm 9+
- Docker and Docker Compose
- PostgreSQL 14+
- Redis 6+
- AWS CLI (for S3 storage)
- Git

### Required Accounts
- AWS Account (for S3, CloudFront, and optional hosting)
- SendGrid Account (for email services)
- Twilio Account (for SMS services)
- Firebase Account (for push notifications)

## Environment Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd timecap-app
npm install
```

### 2. Environment Variables

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Configure the following key variables:

#### Database Configuration
```env
DATABASE_URL=postgresql://username:password@host:port/database
REDIS_URL=redis://host:port
```

#### Authentication
```env
JWT_SECRET=your-super-secure-jwt-secret-32-characters-min
REFRESH_TOKEN_SECRET=your-refresh-token-secret
```

#### External Services
```env
# AWS S3
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
S3_BUCKET_NAME=your-s3-bucket-name

# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key

# Twilio
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token

# Firebase
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
```

## Database Setup

### Development Database

1. Start PostgreSQL and Redis using Docker:
```bash
npm run docker:up
```

2. Run database migrations:
```bash
npm run db:migrate
```

3. Seed the database (optional):
```bash
npm run db:seed
```

### Production Database

For production, use a managed PostgreSQL service:

#### AWS RDS Setup
```bash
# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier timecap-prod \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 14.9 \
  --allocated-storage 20 \
  --db-name timecap_db \
  --master-username timecap_user \
  --master-user-password your-secure-password \
  --vpc-security-group-ids sg-xxxxxxxx \
  --backup-retention-period 7 \
  --multi-az
```

#### Redis Setup (ElastiCache)
```bash
# Create Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id timecap-redis-prod \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1
```

## Backend Deployment

### Docker Deployment

1. Build the backend image:
```bash
cd backend
docker build -t timecap-backend .
```

2. Run with Docker Compose:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### AWS ECS Deployment

1. Create ECS task definition:
```json
{
  "family": "timecap-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::account:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "timecap-backend",
      "image": "your-account.dkr.ecr.region.amazonaws.com/timecap-backend:latest",
      "portMappings": [
        {
          "containerPort": 8000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:timecap/database-url"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/timecap-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

2. Create ECS service:
```bash
aws ecs create-service \
  --cluster timecap-cluster \
  --service-name timecap-backend-service \
  --task-definition timecap-backend \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-12345,subnet-67890],securityGroups=[sg-abcdef],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=arn:aws:elasticloadbalancing:region:account:targetgroup/timecap-backend-tg,containerName=timecap-backend,containerPort=8000"
```

### Kubernetes Deployment

1. Create deployment manifest:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: timecap-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: timecap-backend
  template:
    metadata:
      labels:
        app: timecap-backend
    spec:
      containers:
      - name: timecap-backend
        image: timecap-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: timecap-secrets
              key: database-url
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## Frontend Deployment

### Build for Production

```bash
cd frontend
npm run build
```

### Static Hosting (Netlify/Vercel)

#### Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Configure environment variables in Netlify dashboard

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### AWS S3 + CloudFront

1. Create S3 bucket:
```bash
aws s3 mb s3://timecap-frontend-prod
```

2. Configure bucket for static website hosting:
```bash
aws s3 website s3://timecap-frontend-prod \
  --index-document index.html \
  --error-document error.html
```

3. Upload build files:
```bash
aws s3 sync dist/ s3://timecap-frontend-prod --delete
```

4. Create CloudFront distribution:
```json
{
  "CallerReference": "timecap-frontend-$(date +%s)",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-timecap-frontend-prod",
        "DomainName": "timecap-frontend-prod.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-timecap-frontend-prod",
    "ViewerProtocolPolicy": "redirect-to-https",
    "MinTTL": 0,
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    }
  },
  "Comment": "TimeCap Frontend Distribution",
  "Enabled": true
}
```

## Mobile App Deployment

### iOS App Store

1. Configure app signing in Xcode
2. Archive the app
3. Upload to App Store Connect
4. Submit for review

#### Using EAS (Expo Application Services)

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
cd mobile
eas build:configure

# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

### Google Play Store

1. Generate signed APK:
```bash
cd mobile
eas build --platform android
```

2. Upload to Google Play Console
3. Submit for review

## Infrastructure as Code

### Terraform Configuration

```hcl
# main.tf
provider "aws" {
  region = "us-east-1"
}

# VPC
resource "aws_vpc" "timecap_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "timecap-vpc"
  }
}

# RDS Instance
resource "aws_db_instance" "timecap_db" {
  identifier     = "timecap-prod"
  engine         = "postgres"
  engine_version = "14.9"
  instance_class = "db.t3.micro"
  allocated_storage = 20
  
  db_name  = "timecap_db"
  username = "timecap_user"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.timecap.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "Sun:04:00-Sun:05:00"
  
  skip_final_snapshot = false
  final_snapshot_identifier = "timecap-final-snapshot"
  
  tags = {
    Name = "timecap-database"
  }
}

# S3 Bucket for media storage
resource "aws_s3_bucket" "timecap_media" {
  bucket = "timecap-media-${random_string.bucket_suffix.result}"
}

resource "aws_s3_bucket_versioning" "timecap_media_versioning" {
  bucket = aws_s3_bucket.timecap_media.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "timecap_media_encryption" {
  bucket = aws_s3_bucket.timecap_media.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "timecap_cluster" {
  name = "timecap-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}
```

### Deploy with Terraform

```bash
# Initialize Terraform
terraform init

# Plan deployment
terraform plan

# Apply changes
terraform apply
```

## Monitoring and Logging

### Application Monitoring

#### Sentry Integration
```javascript
// backend/src/config/sentry.ts
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

#### Health Checks
```javascript
// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      s3: await checkS3(),
    }
  };
  
  const isHealthy = Object.values(health.checks).every(check => check.status === 'ok');
  res.status(isHealthy ? 200 : 503).json(health);
});
```

### Logging with Winston

```javascript
// backend/src/config/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'timecap-backend' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### AWS CloudWatch Integration

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  backend:
    image: timecap-backend:latest
    logging:
      driver: awslogs
      options:
        awslogs-region: us-east-1
        awslogs-group: /aws/ecs/timecap-backend
        awslogs-stream-prefix: ecs
```

## Scaling Considerations

### Horizontal Scaling

1. **Load Balancing**: Use Application Load Balancer (ALB) to distribute traffic
2. **Auto Scaling**: Configure ECS or Kubernetes auto-scaling based on CPU/memory usage
3. **Database Read Replicas**: Set up read replicas for read-heavy workloads

### Caching Strategy

```javascript
// Redis caching middleware
const cache = (duration = 300) => {
  return async (req, res, next) => {
    const key = req.originalUrl;
    const cached = await redisClient.get(key);
    
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    res.sendResponse = res.json;
    res.json = (body) => {
      redisClient.setex(key, duration, JSON.stringify(body));
      res.sendResponse(body);
    };
    
    next();
  };
};
```

### CDN Configuration

```javascript
// CloudFront cache behaviors
const cacheBehaviors = [
  {
    pathPattern: '/api/*',
    cachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad', // CachingDisabled
    originRequestPolicyId: '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf', // CORS-S3Origin
  },
  {
    pathPattern: '/static/*',
    cachePolicyId: '658327ea-f89d-4fab-a63d-7e88639e58f6', // CachingOptimized
    compress: true,
  }
];
```

### Database Optimization

```sql
-- Create indexes for common queries
CREATE INDEX CONCURRENTLY idx_capsules_user_id_scheduled_for 
ON capsules(user_id, scheduled_for) 
WHERE status = 'SCHEDULED';

CREATE INDEX CONCURRENTLY idx_capsules_scheduled_for_status 
ON capsules(scheduled_for, status);

CREATE INDEX CONCURRENTLY idx_media_capsule_id 
ON media(capsule_id);

-- Partition large tables by date
CREATE TABLE capsules_2024 PARTITION OF capsules 
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

## Security Checklist

- [ ] Enable HTTPS/TLS for all endpoints
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Implement proper authentication and authorization
- [ ] Encrypt sensitive data at rest
- [ ] Regular security updates
- [ ] Enable audit logging
- [ ] Configure firewall rules
- [ ] Use secrets management service (AWS Secrets Manager)

## Backup and Disaster Recovery

### Database Backups

```bash
# Automated daily backups
#!/bin/bash
BACKUP_NAME="timecap_backup_$(date +%Y%m%d_%H%M%S)"
pg_dump $DATABASE_URL > /backups/$BACKUP_NAME.sql
aws s3 cp /backups/$BACKUP_NAME.sql s3://timecap-backups/
```

### Media File Backups

```bash
# S3 Cross-Region Replication
aws s3api put-bucket-replication \
  --bucket timecap-media-prod \
  --replication-configuration file://replication.json
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check security groups and network ACLs
   - Verify connection string format
   - Check database credentials

2. **File Upload Issues**
   - Verify S3 bucket permissions
   - Check AWS credentials
   - Validate file size limits

3. **Email/SMS Not Sending**
   - Check API keys and credentials
   - Verify sender domains
   - Check rate limits

### Debugging Tools

```bash
# Check application logs
kubectl logs -f deployment/timecap-backend

# Database connection test
psql $DATABASE_URL -c "SELECT version();"

# Redis connection test
redis-cli -u $REDIS_URL ping
```

## Performance Monitoring

### Key Metrics to Monitor

- Response time (95th percentile < 500ms)
- Error rate (< 1%)
- Database connection pool usage
- Memory and CPU utilization
- Queue processing times
- File upload success rates

### Alerting Rules

```yaml
# Prometheus alerting rules
groups:
- name: timecap-alerts
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
    for: 5m
    annotations:
      summary: High error rate detected
      
  - alert: DatabaseConnectionHigh
    expr: postgres_connections_active / postgres_connections_max > 0.8
    for: 2m
    annotations:
      summary: Database connection pool usage high
```

---

For additional support or questions about deployment, please refer to the project documentation or contact the development team.