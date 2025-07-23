import { z } from 'zod';

// Base Types
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// User Types
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  username: z.string().min(3).max(50),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  avatar: z.string().url().optional(),
  phone: z.string().optional(),
  timezone: z.string().default('UTC'),
  isEmailVerified: z.boolean().default(false),
  isPhoneVerified: z.boolean().default(false),
  twoFactorEnabled: z.boolean().default(false),
  lastLoginAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

// Capsule Types
export enum CapsuleStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export enum CapsulePrivacy {
  PRIVATE = 'private',
  PUBLIC = 'public',
  RECIPIENTS_ONLY = 'recipients_only',
}

export enum MediaType {
  AUDIO = 'audio',
  VIDEO = 'video',
  IMAGE = 'image',
  TEXT = 'text',
}

export const CapsuleSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  status: z.nativeEnum(CapsuleStatus),
  privacy: z.nativeEnum(CapsulePrivacy),
  scheduledFor: z.date(),
  deliveredAt: z.date().optional(),
  timezone: z.string(),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.string().optional(),
  tags: z.array(z.string()).default([]),
  emotionalTag: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Capsule = z.infer<typeof CapsuleSchema>;

// Media Types
export const MediaSchema = z.object({
  id: z.string().uuid(),
  capsuleId: z.string().uuid(),
  type: z.nativeEnum(MediaType),
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  duration: z.number().optional(), // for audio/video in seconds
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  transcription: z.string().optional(),
  isEncrypted: z.boolean().default(true),
  encryptionKey: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Media = z.infer<typeof MediaSchema>;

// Recipient Types
export enum RecipientType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  USER = 'user',
}

export const RecipientSchema = z.object({
  id: z.string().uuid(),
  capsuleId: z.string().uuid(),
  type: z.nativeEnum(RecipientType),
  value: z.string(), // email, phone, userId
  name: z.string().optional(),
  isDelivered: z.boolean().default(false),
  deliveredAt: z.date().optional(),
  failureReason: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Recipient = z.infer<typeof RecipientSchema>;

// Notification Types
export enum NotificationType {
  CAPSULE_DELIVERED = 'capsule_delivered',
  CAPSULE_REMINDER = 'capsule_reminder',
  CAPSULE_FAILED = 'capsule_failed',
  ACCOUNT_VERIFICATION = 'account_verification',
  SECURITY_ALERT = 'security_alert',
}

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.nativeEnum(NotificationType),
  title: z.string(),
  message: z.string(),
  data: z.record(z.any()).optional(),
  isRead: z.boolean().default(false),
  sentAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Notification = z.infer<typeof NotificationSchema>;

// Legacy Contact Types
export const LegacyContactSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  relationship: z.string(),
  isVerified: z.boolean().default(false),
  verificationToken: z.string().optional(),
  activationDelay: z.number().default(365), // days
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type LegacyContact = z.infer<typeof LegacyContactSchema>;

// API Request/Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Authentication Types
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  rememberMe: z.boolean().optional(),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  username: z.string().min(3).max(50),
  timezone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type LoginRequest = z.infer<typeof LoginSchema>;
export type RegisterRequest = z.infer<typeof RegisterSchema>;

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// Capsule Creation Types
export const CreateCapsuleSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  scheduledFor: z.string().datetime(),
  privacy: z.nativeEnum(CapsulePrivacy),
  timezone: z.string(),
  tags: z.array(z.string()).optional(),
  emotionalTag: z.string().optional(),
  recipients: z.array(z.object({
    type: z.nativeEnum(RecipientType),
    value: z.string(),
    name: z.string().optional(),
  })).optional(),
});

export type CreateCapsuleRequest = z.infer<typeof CreateCapsuleSchema>;

// File Upload Types
export interface FileUploadResponse {
  id: string;
  url: string;
  thumbnailUrl?: string;
  filename: string;
  size: number;
  mimeType: string;
  duration?: number;
}

// Search Types
export interface SearchParams {
  query?: string;
  status?: CapsuleStatus[];
  privacy?: CapsulePrivacy[];
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  mediaType?: MediaType[];
}

export interface SearchResult {
  capsules: Capsule[];
  total: number;
  facets: {
    statuses: Array<{ value: CapsuleStatus; count: number }>;
    tags: Array<{ value: string; count: number }>;
    mediaTypes: Array<{ value: MediaType; count: number }>;
  };
}

// WebSocket Types
export enum WebSocketEventType {
  CAPSULE_DELIVERED = 'capsule_delivered',
  CAPSULE_REMINDER = 'capsule_reminder',
  NOTIFICATION_RECEIVED = 'notification_received',
  USER_ACTIVITY = 'user_activity',
}

export interface WebSocketEvent {
  type: WebSocketEventType;
  data: any;
  timestamp: string;
  userId?: string;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  validationErrors?: ValidationError[];
}