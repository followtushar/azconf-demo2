// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isActive: boolean;
  preferences: UserPreferences;
}

export interface UserPreferences {
  timezone: string;
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  reminderDays: number[];
}

export interface PrivacySettings {
  defaultVisibility: CapsuleVisibility;
  allowDiscovery: boolean;
  showActivity: boolean;
}

// Capsule Types
export interface Capsule {
  id: string;
  title: string;
  description?: string;
  creatorId: string;
  scheduledFor: Date;
  createdAt: Date;
  updatedAt: Date;
  deliveredAt?: Date;
  visibility: CapsuleVisibility;
  status: CapsuleStatus;
  mediaFiles: MediaFile[];
  recipients: CapsuleRecipient[];
  tags: string[];
  encryptionKey?: string;
  legacySettings?: LegacySettings;
}

export type CapsuleVisibility = 'private' | 'public' | 'recipients_only';
export type CapsuleStatus = 'draft' | 'scheduled' | 'delivered' | 'cancelled' | 'failed';

export interface CapsuleRecipient {
  id: string;
  capsuleId: string;
  type: RecipientType;
  identifier: string; // email, phone, or user ID
  name?: string;
  deliveredAt?: Date;
  viewedAt?: Date;
  status: DeliveryStatus;
}

export type RecipientType = 'email' | 'sms' | 'user' | 'self';
export type DeliveryStatus = 'pending' | 'sent' | 'delivered' | 'viewed' | 'failed';

export interface LegacySettings {
  enabled: boolean;
  contacts: LegacyContact[];
  inactivityThresholdDays: number;
}

export interface LegacyContact {
  id: string;
  name: string;
  email: string;
  relationship: string;
}

// Media Types
export interface MediaFile {
  id: string;
  capsuleId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  duration?: number; // for audio/video in seconds
  url: string;
  thumbnailUrl?: string;
  type: MediaType;
  uploadedAt: Date;
  metadata?: MediaMetadata;
}

export type MediaType = 'audio' | 'video' | 'image' | 'document';

export interface MediaMetadata {
  width?: number;
  height?: number;
  duration?: number;
  bitrate?: number;
  codec?: string;
  format?: string;
}

// Authentication Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
}

export interface OAuthProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  provider: OAuthProvider;
}

export type OAuthProvider = 'google' | 'facebook' | 'github';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  pagination?: PaginationInfo;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Request/Response Types
export interface CreateCapsuleRequest {
  title: string;
  description?: string;
  scheduledFor: Date;
  visibility: CapsuleVisibility;
  recipients: CreateRecipientRequest[];
  tags?: string[];
  legacySettings?: LegacySettings;
}

export interface CreateRecipientRequest {
  type: RecipientType;
  identifier: string;
  name?: string;
}

export interface UpdateCapsuleRequest {
  title?: string;
  description?: string;
  scheduledFor?: Date;
  visibility?: CapsuleVisibility;
  tags?: string[];
}

export interface CapsuleFilters {
  status?: CapsuleStatus;
  visibility?: CapsuleVisibility;
  scheduledAfter?: Date;
  scheduledBefore?: Date;
  tags?: string[];
  search?: string;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

export type NotificationType = 
  | 'capsule_delivered' 
  | 'capsule_reminder' 
  | 'capsule_failed' 
  | 'legacy_activation'
  | 'account_security'
  | 'system_update';

// Job Queue Types
export interface ScheduledJob {
  id: string;
  type: JobType;
  data: any;
  scheduledFor: Date;
  attempts: number;
  maxAttempts: number;
  status: JobStatus;
  createdAt: Date;
  processedAt?: Date;
  error?: string;
}

export type JobType = 
  | 'deliver_capsule'
  | 'send_reminder'
  | 'process_media'
  | 'cleanup_expired'
  | 'check_legacy_users';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

// Analytics Types
export interface CapsuleAnalytics {
  totalCapsules: number;
  scheduledCapsules: number;
  deliveredCapsules: number;
  failedCapsules: number;
  averageDeliveryTime: number;
  popularTags: TagStats[];
  deliveryStats: DeliveryStats;
}

export interface TagStats {
  tag: string;
  count: number;
}

export interface DeliveryStats {
  daily: number[];
  weekly: number[];
  monthly: number[];
}

// WebSocket Types
export interface WebSocketMessage {
  type: WebSocketMessageType;
  data: any;
  timestamp: Date;
}

export type WebSocketMessageType = 
  | 'capsule_delivered'
  | 'notification'
  | 'status_update'
  | 'error';

// Utility Types
export type Timestamp = Date | string;
export type UUID = string;

export interface PaginatedRequest {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FileUpload {
  file: File;
  type: MediaType;
  metadata?: Partial<MediaMetadata>;
}