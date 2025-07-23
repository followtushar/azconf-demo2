import { z } from 'zod';

// Environment variables schema
const envSchema = z.object({
  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // API Configuration
  API_PORT: z.coerce.number().default(8000),
  API_URL: z.string().default('http://localhost:8000'),
  WEB_URL: z.string().default('http://localhost:3000'),
  
  // Database
  DATABASE_URL: z.string(),
  
  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),
  
  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  
  // Storage
  STORAGE_PROVIDER: z.enum(['local', 'azure', 'aws', 'gcp']).default('azure'),
  STORAGE_PATH: z.string().default('./uploads'),
  
  // Azure Storage
  AZURE_STORAGE_ACCOUNT_NAME: z.string().optional(),
  AZURE_STORAGE_ACCOUNT_KEY: z.string().optional(),
  AZURE_STORAGE_CONNECTION_STRING: z.string().optional(),
  AZURE_STORAGE_CONTAINER_NAME: z.string().default('timecap-media'),
  AZURE_STORAGE_SAS_TOKEN: z.string().optional(),
  AZURE_CDN_ENDPOINT: z.string().optional(),
  
  // Azure Communication Services - Email
  AZURE_COMMUNICATION_CONNECTION_STRING: z.string().optional(),
  AZURE_COMMUNICATION_EMAIL_ENDPOINT: z.string().optional(),
  FROM_EMAIL: z.string().email().default('noreply@timecap.app'),
  FROM_NAME: z.string().default('TimeCap'),
  
  // Azure Communication Services - SMS
  AZURE_COMMUNICATION_SMS_CONNECTION_STRING: z.string().optional(),
  AZURE_COMMUNICATION_PHONE_NUMBER: z.string().optional(),
  
  // Azure Notification Hubs
  AZURE_NOTIFICATION_HUB_CONNECTION_STRING: z.string().optional(),
  AZURE_NOTIFICATION_HUB_NAME: z.string().optional(),
  
  // OAuth
  AZURE_AD_CLIENT_ID: z.string().optional(),
  AZURE_AD_CLIENT_SECRET: z.string().optional(),
  AZURE_AD_TENANT_ID: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  
  // Azure Key Vault
  AZURE_KEY_VAULT_URL: z.string().optional(),
  AZURE_CLIENT_ID: z.string().optional(),
  AZURE_CLIENT_SECRET: z.string().optional(),
  AZURE_TENANT_ID: z.string().optional(),
  
  // Azure Application Insights
  AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING: z.string().optional(),
  AZURE_APPLICATION_INSIGHTS_INSTRUMENTATION_KEY: z.string().optional(),
  
  // Azure Service Bus
  AZURE_SERVICE_BUS_CONNECTION_STRING: z.string().optional(),
  AZURE_SERVICE_BUS_QUEUE_NAME: z.string().default('timecap-jobs'),
  
  // Azure Database for PostgreSQL
  AZURE_POSTGRES_HOST: z.string().optional(),
  AZURE_POSTGRES_USER: z.string().optional(),
  AZURE_POSTGRES_PASSWORD: z.string().optional(),
  AZURE_POSTGRES_DATABASE: z.string().default('timecap'),
  AZURE_POSTGRES_PORT: z.coerce.number().default(5432),
  AZURE_POSTGRES_SSL_MODE: z.string().default('require'),
  
  // Azure Cache for Redis
  AZURE_REDIS_HOST: z.string().optional(),
  AZURE_REDIS_PORT: z.coerce.number().default(6380),
  AZURE_REDIS_PASSWORD: z.string().optional(),
  AZURE_REDIS_SSL: z.coerce.boolean().default(true),
  
  // Encryption
  ENCRYPTION_KEY: z.string().length(32),
  ENCRYPTION_ALGORITHM: z.string().default('aes-256-gcm'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  
  // File Upload Limits
  MAX_FILE_SIZE: z.coerce.number().default(100), // MB
  MAX_VIDEO_DURATION: z.coerce.number().default(600), // seconds
  MAX_AUDIO_DURATION: z.coerce.number().default(1800), // seconds
  
  // Security
  BCRYPT_ROUNDS: z.coerce.number().default(12),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  AZURE_LOG_ANALYTICS_WORKSPACE_ID: z.string().optional(),
  AZURE_LOG_ANALYTICS_SHARED_KEY: z.string().optional(),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

// Export configuration object
export const config = {
  env: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
  
  api: {
    port: env.API_PORT,
    url: env.API_URL,
  },
  
  web: {
    url: env.WEB_URL,
  },
  
  database: {
    url: env.DATABASE_URL,
    azure: {
      host: env.AZURE_POSTGRES_HOST,
      user: env.AZURE_POSTGRES_USER,
      password: env.AZURE_POSTGRES_PASSWORD,
      database: env.AZURE_POSTGRES_DATABASE,
      port: env.AZURE_POSTGRES_PORT,
      sslMode: env.AZURE_POSTGRES_SSL_MODE,
    },
  },
  
  redis: {
    url: env.REDIS_URL,
    azure: {
      host: env.AZURE_REDIS_HOST,
      port: env.AZURE_REDIS_PORT,
      password: env.AZURE_REDIS_PASSWORD,
      ssl: env.AZURE_REDIS_SSL,
    },
  },
  
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
    refreshSecret: env.REFRESH_TOKEN_SECRET,
    refreshExpiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
  },
  
  storage: {
    provider: env.STORAGE_PROVIDER,
    path: env.STORAGE_PATH,
    azure: {
      accountName: env.AZURE_STORAGE_ACCOUNT_NAME,
      accountKey: env.AZURE_STORAGE_ACCOUNT_KEY,
      connectionString: env.AZURE_STORAGE_CONNECTION_STRING,
      containerName: env.AZURE_STORAGE_CONTAINER_NAME,
      sasToken: env.AZURE_STORAGE_SAS_TOKEN,
      cdnEndpoint: env.AZURE_CDN_ENDPOINT,
    },
  },
  
  communication: {
    email: {
      connectionString: env.AZURE_COMMUNICATION_CONNECTION_STRING,
      endpoint: env.AZURE_COMMUNICATION_EMAIL_ENDPOINT,
      fromEmail: env.FROM_EMAIL,
      fromName: env.FROM_NAME,
    },
    sms: {
      connectionString: env.AZURE_COMMUNICATION_SMS_CONNECTION_STRING,
      phoneNumber: env.AZURE_COMMUNICATION_PHONE_NUMBER,
    },
  },
  
  notifications: {
    azure: {
      connectionString: env.AZURE_NOTIFICATION_HUB_CONNECTION_STRING,
      hubName: env.AZURE_NOTIFICATION_HUB_NAME,
    },
  },
  
  oauth: {
    azureAd: {
      clientId: env.AZURE_AD_CLIENT_ID,
      clientSecret: env.AZURE_AD_CLIENT_SECRET,
      tenantId: env.AZURE_AD_TENANT_ID,
    },
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    },
  },
  
  azure: {
    keyVault: {
      url: env.AZURE_KEY_VAULT_URL,
      clientId: env.AZURE_CLIENT_ID,
      clientSecret: env.AZURE_CLIENT_SECRET,
      tenantId: env.AZURE_TENANT_ID,
    },
    applicationInsights: {
      connectionString: env.AZURE_APPLICATION_INSIGHTS_CONNECTION_STRING,
      instrumentationKey: env.AZURE_APPLICATION_INSIGHTS_INSTRUMENTATION_KEY,
    },
    serviceBus: {
      connectionString: env.AZURE_SERVICE_BUS_CONNECTION_STRING,
      queueName: env.AZURE_SERVICE_BUS_QUEUE_NAME,
    },
    logAnalytics: {
      workspaceId: env.AZURE_LOG_ANALYTICS_WORKSPACE_ID,
      sharedKey: env.AZURE_LOG_ANALYTICS_SHARED_KEY,
    },
  },
  
  encryption: {
    key: env.ENCRYPTION_KEY,
    algorithm: env.ENCRYPTION_ALGORITHM,
  },
  
  rateLimit: {
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    maxRequests: env.RATE_LIMIT_MAX_REQUESTS,
  },
  
  upload: {
    maxFileSize: env.MAX_FILE_SIZE * 1024 * 1024, // Convert MB to bytes
    maxVideoDuration: env.MAX_VIDEO_DURATION,
    maxAudioDuration: env.MAX_AUDIO_DURATION,
  },
  
  security: {
    bcryptRounds: env.BCRYPT_ROUNDS,
  },
  
  cors: {
    origin: env.CORS_ORIGIN,
  },
  
  logging: {
    level: env.LOG_LEVEL,
  },
} as const;