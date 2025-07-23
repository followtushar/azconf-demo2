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
  STORAGE_PROVIDER: z.enum(['local', 'aws', 'azure', 'gcp']).default('local'),
  STORAGE_PATH: z.string().default('./uploads'),
  
  // AWS S3
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION: z.string().default('us-east-1'),
  AWS_S3_BUCKET: z.string().optional(),
  
  // Email
  SENDGRID_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().default('noreply@timecap.app'),
  FROM_NAME: z.string().default('TimeCap'),
  
  // SMS
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  
  // OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  
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
  },
  
  redis: {
    url: env.REDIS_URL,
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
    aws: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      region: env.AWS_REGION,
      bucket: env.AWS_S3_BUCKET,
    },
  },
  
  email: {
    sendgridApiKey: env.SENDGRID_API_KEY,
    fromEmail: env.FROM_EMAIL,
    fromName: env.FROM_NAME,
  },
  
  sms: {
    twilioAccountSid: env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: env.TWILIO_AUTH_TOKEN,
    twilioPhoneNumber: env.TWILIO_PHONE_NUMBER,
  },
  
  oauth: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    facebook: {
      appId: env.FACEBOOK_APP_ID,
      appSecret: env.FACEBOOK_APP_SECRET,
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
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