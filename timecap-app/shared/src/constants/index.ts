// File Size Limits (in bytes)
export const FILE_LIMITS = {
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_AUDIO_SIZE: 50 * 1024 * 1024,  // 50MB
  MAX_VIDEO_SIZE: 100 * 1024 * 1024, // 100MB
  MAX_IMAGE_SIZE: 10 * 1024 * 1024,  // 10MB
} as const;

// Duration Limits (in seconds)
export const DURATION_LIMITS = {
  MAX_AUDIO_DURATION: 60 * 60,      // 1 hour
  MAX_VIDEO_DURATION: 30 * 60,      // 30 minutes
  MIN_SCHEDULE_DELAY: 60 * 60,      // 1 hour minimum
  MAX_SCHEDULE_DELAY: 50 * 365 * 24 * 60 * 60, // 50 years
} as const;

// Supported File Types
export const SUPPORTED_MIME_TYPES = {
  AUDIO: [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp4',
    'audio/aac',
    'audio/webm'
  ],
  VIDEO: [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/webm',
    'video/avi'
  ],
  IMAGE: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp'
  ]
} as const;

// API Configuration
export const API_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  JWT_EXPIRES_IN: '7d',
  REFRESH_TOKEN_EXPIRES_IN: '30d',
} as const;

// Notification Settings
export const NOTIFICATION_CONFIG = {
  REMINDER_INTERVALS: [
    { label: '1 hour before', value: 60 * 60 },
    { label: '1 day before', value: 24 * 60 * 60 },
    { label: '1 week before', value: 7 * 24 * 60 * 60 },
    { label: '1 month before', value: 30 * 24 * 60 * 60 },
  ],
  MAX_RECIPIENTS_PER_CAPSULE: 10,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 5 * 60 * 1000, // 5 minutes
} as const;

// Encryption Settings
export const ENCRYPTION_CONFIG = {
  ALGORITHM: 'aes-256-gcm',
  KEY_LENGTH: 32,
  IV_LENGTH: 16,
  SALT_ROUNDS: 12,
} as const;

// Time Zones
export const COMMON_TIMEZONES = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
  { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
  { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Shanghai', label: 'Shanghai' },
  { value: 'Asia/Kolkata', label: 'Mumbai/New Delhi' },
  { value: 'Australia/Sydney', label: 'Sydney' },
] as const;

// Emotional Tags
export const EMOTIONAL_TAGS = [
  { value: 'love', label: '❤️ Love', color: '#ff6b6b' },
  { value: 'celebration', label: '🎉 Celebration', color: '#4ecdc4' },
  { value: 'wisdom', label: '🧠 Wisdom', color: '#45b7d1' },
  { value: 'encouragement', label: '💪 Encouragement', color: '#96ceb4' },
  { value: 'memory', label: '📸 Memory', color: '#feca57' },
  { value: 'gratitude', label: '🙏 Gratitude', color: '#ff9ff3' },
  { value: 'hope', label: '🌟 Hope', color: '#54a0ff' },
  { value: 'advice', label: '💡 Advice', color: '#5f27cd' },
  { value: 'apology', label: '😔 Apology', color: '#ff6348' },
  { value: 'surprise', label: '🎁 Surprise', color: '#ff9f43' },
] as const;

// Default Values
export const DEFAULTS = {
  TIMEZONE: 'UTC',
  PRIVACY: 'private',
  PAGE_SIZE: 20,
  REMINDER_TIME: 24 * 60 * 60, // 1 day before
  LEGACY_ACTIVATION_DELAY: 365, // 1 year
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  USERNAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z0-9_]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  TITLE: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 200,
  },
  DESCRIPTION: {
    MAX_LENGTH: 1000,
  },
  NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
  },
} as const;

// Error Codes
export const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  USERNAME_ALREADY_EXISTS: 'USERNAME_ALREADY_EXISTS',
  
  // Authorization
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  ACCESS_DENIED: 'ACCESS_DENIED',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // File Upload
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  
  // Capsule
  CAPSULE_NOT_FOUND: 'CAPSULE_NOT_FOUND',
  INVALID_SCHEDULE_DATE: 'INVALID_SCHEDULE_DATE',
  CAPSULE_ALREADY_DELIVERED: 'CAPSULE_ALREADY_DELIVERED',
  
  // System
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  NETWORK_ERROR: 'NETWORK_ERROR',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CAPSULE_CREATED: 'Time capsule created successfully!',
  CAPSULE_UPDATED: 'Time capsule updated successfully!',
  CAPSULE_DELETED: 'Time capsule deleted successfully!',
  CAPSULE_DELIVERED: 'Time capsule delivered successfully!',
  USER_REGISTERED: 'Account created successfully!',
  USER_LOGGED_IN: 'Welcome back!',
  EMAIL_VERIFIED: 'Email verified successfully!',
  PASSWORD_RESET: 'Password reset successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  FILE_UPLOADED: 'File uploaded successfully!',
} as const;

// WebSocket Events
export const WS_EVENTS = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  CAPSULE_DELIVERED: 'capsule_delivered',
  CAPSULE_REMINDER: 'capsule_reminder',
  NOTIFICATION_RECEIVED: 'notification_received',
  USER_ACTIVITY: 'user_activity',
  TYPING: 'typing',
  STOP_TYPING: 'stop_typing',
} as const;

// Cache Keys
export const CACHE_KEYS = {
  USER_SESSION: (userId: string) => `user_session:${userId}`,
  CAPSULE_LIST: (userId: string, page: number) => `capsules:${userId}:${page}`,
  USER_PROFILE: (userId: string) => `profile:${userId}`,
  NOTIFICATION_COUNT: (userId: string) => `notifications:${userId}:count`,
  MEDIA_METADATA: (mediaId: string) => `media:${mediaId}:metadata`,
} as const;

// Queue Names
export const QUEUE_NAMES = {
  CAPSULE_DELIVERY: 'capsule-delivery',
  EMAIL_NOTIFICATIONS: 'email-notifications',
  SMS_NOTIFICATIONS: 'sms-notifications',
  PUSH_NOTIFICATIONS: 'push-notifications',
  MEDIA_PROCESSING: 'media-processing',
  CLEANUP_TASKS: 'cleanup-tasks',
} as const;

// Database Table Names
export const TABLE_NAMES = {
  USERS: 'users',
  CAPSULES: 'capsules',
  MEDIA: 'media',
  RECIPIENTS: 'recipients',
  NOTIFICATIONS: 'notifications',
  LEGACY_CONTACTS: 'legacy_contacts',
  USER_SESSIONS: 'user_sessions',
  AUDIT_LOGS: 'audit_logs',
} as const;