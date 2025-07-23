# TimeCap API Documentation

This document provides comprehensive documentation for the TimeCap REST API.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Error Handling](#error-handling)
4. [Rate Limiting](#rate-limiting)
5. [Endpoints](#endpoints)
   - [Authentication](#authentication-endpoints)
   - [Users](#user-endpoints)
   - [Capsules](#capsule-endpoints)
   - [Media](#media-endpoints)
   - [Notifications](#notification-endpoints)
   - [Legacy Contacts](#legacy-contact-endpoints)

## Overview

**Base URL:** `https://api.timecap.app` (Production) or `http://localhost:8000` (Development)

**API Version:** v1

**Content Type:** `application/json`

All API endpoints return JSON responses and follow RESTful conventions.

## Authentication

TimeCap uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Token Lifecycle
- **Access Token:** Valid for 7 days
- **Refresh Token:** Valid for 30 days
- **Automatic Refresh:** Tokens are automatically refreshed when they expire

## Error Handling

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {},
  "validationErrors": [
    {
      "field": "email",
      "message": "Invalid email format",
      "code": "INVALID_FORMAT"
    }
  ]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## Rate Limiting

API requests are limited to:
- **100 requests per 15 minutes** per IP address
- **1000 requests per hour** per authenticated user

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Endpoints

### Authentication Endpoints

#### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "confirmPassword": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe",
  "timezone": "America/New_York"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": null,
      "timezone": "America/New_York",
      "isEmailVerified": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresIn": 604800
  },
  "message": "Account created successfully!"
}
```

#### POST /api/auth/login

Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "rememberMe": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": null,
      "timezone": "America/New_York",
      "lastLoginAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token",
    "refreshToken": "refresh-token",
    "expiresIn": 604800
  },
  "message": "Welcome back!"
}
```

#### POST /api/auth/refresh

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "new-jwt-token",
    "refreshToken": "new-refresh-token",
    "expiresIn": 604800
  }
}
```

#### POST /api/auth/logout

Logout user and invalidate tokens.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### POST /api/auth/forgot-password

Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

#### POST /api/auth/reset-password

Reset password using reset token.

**Request Body:**
```json
{
  "token": "reset-token",
  "password": "NewSecurePassword123!",
  "confirmPassword": "NewSecurePassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

### User Endpoints

#### GET /api/users/me

Get current user profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://cdn.timecap.app/avatars/user.jpg",
    "phone": "+1234567890",
    "timezone": "America/New_York",
    "isEmailVerified": true,
    "isPhoneVerified": false,
    "twoFactorEnabled": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /api/users/me

Update current user profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "timezone": "America/Los_Angeles"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Smith",
    "phone": "+1234567890",
    "timezone": "America/Los_Angeles",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Profile updated successfully"
}
```

#### POST /api/users/me/avatar

Upload user avatar.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body:**
```
avatar: <file>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "avatar": "https://cdn.timecap.app/avatars/user.jpg"
  },
  "message": "Avatar updated successfully"
}
```

### Capsule Endpoints

#### GET /api/capsules

Get user's capsules with pagination and filtering.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)
- `status` (string: draft|scheduled|delivered|cancelled|failed)
- `privacy` (string: private|public|recipients_only)
- `tags` (string, comma-separated)
- `search` (string)
- `sortBy` (string: createdAt|scheduledFor|title)
- `sortOrder` (string: asc|desc, default: desc)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Birthday Message for Sarah",
      "description": "A special message for Sarah's 18th birthday",
      "status": "scheduled",
      "privacy": "private",
      "scheduledFor": "2024-06-15T12:00:00.000Z",
      "deliveredAt": null,
      "timezone": "America/New_York",
      "isRecurring": false,
      "tags": ["birthday", "family"],
      "emotionalTag": "love",
      "media": [
        {
          "id": "uuid",
          "type": "video",
          "filename": "birthday_message.mp4",
          "thumbnailUrl": "https://cdn.timecap.app/thumbnails/thumb.jpg",
          "duration": 120,
          "size": 15728640
        }
      ],
      "recipients": [
        {
          "id": "uuid",
          "type": "email",
          "value": "sarah@example.com",
          "name": "Sarah Doe",
          "isDelivered": false
        }
      ],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

#### GET /api/capsules/:id

Get specific capsule by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Birthday Message for Sarah",
    "description": "A special message for Sarah's 18th birthday",
    "status": "scheduled",
    "privacy": "private",
    "scheduledFor": "2024-06-15T12:00:00.000Z",
    "timezone": "America/New_York",
    "tags": ["birthday", "family"],
    "emotionalTag": "love",
    "media": [...],
    "recipients": [...],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### POST /api/capsules

Create a new time capsule.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Birthday Message for Sarah",
  "description": "A special message for Sarah's 18th birthday",
  "scheduledFor": "2024-06-15T12:00:00.000Z",
  "privacy": "private",
  "timezone": "America/New_York",
  "tags": ["birthday", "family"],
  "emotionalTag": "love",
  "recipients": [
    {
      "type": "email",
      "value": "sarah@example.com",
      "name": "Sarah Doe"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Birthday Message for Sarah",
    "status": "draft",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Time capsule created successfully!"
}
```

#### PUT /api/capsules/:id

Update existing capsule.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Updated Birthday Message",
  "description": "Updated description",
  "scheduledFor": "2024-06-15T15:00:00.000Z",
  "tags": ["birthday", "family", "special"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Updated Birthday Message",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Time capsule updated successfully!"
}
```

#### DELETE /api/capsules/:id

Delete a capsule.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Time capsule deleted successfully!"
}
```

#### POST /api/capsules/:id/schedule

Schedule a draft capsule for delivery.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "scheduled",
    "scheduledFor": "2024-06-15T12:00:00.000Z"
  },
  "message": "Time capsule scheduled successfully!"
}
```

#### POST /api/capsules/:id/cancel

Cancel a scheduled capsule.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "cancelled"
  },
  "message": "Time capsule cancelled successfully!"
}
```

### Media Endpoints

#### POST /api/media/upload

Upload media file for a capsule.

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body:**
```
file: <file>
capsuleId: uuid
type: audio|video|image
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "video",
    "filename": "video_20240101_120000.mp4",
    "originalName": "my_video.mp4",
    "mimeType": "video/mp4",
    "size": 15728640,
    "duration": 120,
    "url": "https://cdn.timecap.app/media/video_20240101_120000.mp4",
    "thumbnailUrl": "https://cdn.timecap.app/thumbnails/thumb.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "File uploaded successfully!"
}
```

#### GET /api/media/:id

Get media file details.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "type": "video",
    "filename": "video_20240101_120000.mp4",
    "url": "https://cdn.timecap.app/media/video_20240101_120000.mp4",
    "thumbnailUrl": "https://cdn.timecap.app/thumbnails/thumb.jpg",
    "duration": 120,
    "size": 15728640,
    "transcription": "Hello, this is my message...",
    "metadata": {
      "width": 1920,
      "height": 1080,
      "codec": "h264"
    }
  }
}
```

#### DELETE /api/media/:id

Delete media file.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Media file deleted successfully!"
}
```

#### POST /api/media/:id/transcribe

Request transcription for audio/video media.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "transcriptionId": "uuid",
    "status": "processing"
  },
  "message": "Transcription started"
}
```

### Notification Endpoints

#### GET /api/notifications

Get user notifications.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `type` (string)
- `unread` (boolean)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "capsule_delivered",
      "title": "Time Capsule Delivered",
      "message": "Your time capsule 'Birthday Message for Sarah' has been delivered",
      "data": {
        "capsuleId": "uuid",
        "capsuleTitle": "Birthday Message for Sarah"
      },
      "isRead": false,
      "sentAt": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

#### PUT /api/notifications/:id/read

Mark notification as read.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "isRead": true
  }
}
```

#### PUT /api/notifications/read-all

Mark all notifications as read.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

#### GET /api/notifications/unread-count

Get count of unread notifications.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

### Legacy Contact Endpoints

#### GET /api/legacy-contacts

Get user's legacy contacts.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "trusted@example.com",
      "name": "Trusted Contact",
      "relationship": "Spouse",
      "isVerified": true,
      "activationDelay": 365,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /api/legacy-contacts

Add new legacy contact.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "email": "trusted@example.com",
  "name": "Trusted Contact",
  "relationship": "Spouse",
  "activationDelay": 365
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "trusted@example.com",
    "name": "Trusted Contact",
    "relationship": "Spouse",
    "isVerified": false,
    "activationDelay": 365,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Legacy contact added successfully"
}
```

#### PUT /api/legacy-contacts/:id

Update legacy contact.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Updated Name",
  "relationship": "Best Friend",
  "activationDelay": 180
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Updated Name",
    "relationship": "Best Friend",
    "activationDelay": 180,
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Legacy contact updated successfully"
}
```

#### DELETE /api/legacy-contacts/:id

Remove legacy contact.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Legacy contact removed successfully"
}
```

#### POST /api/legacy-contacts/:id/verify

Send verification email to legacy contact.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Verification email sent"
}
```

## WebSocket Events

TimeCap uses WebSocket connections for real-time updates.

**Connection URL:** `wss://api.timecap.app/socket.io`

### Authentication
Include the JWT token in the connection query:
```javascript
const socket = io('wss://api.timecap.app', {
  query: { token: 'your-jwt-token' }
});
```

### Events

#### Client to Server

**join_user_room**
```javascript
socket.emit('join_user_room', { userId: 'uuid' });
```

#### Server to Client

**capsule_delivered**
```javascript
socket.on('capsule_delivered', (data) => {
  // data: { capsuleId, title, deliveredAt }
});
```

**capsule_reminder**
```javascript
socket.on('capsule_reminder', (data) => {
  // data: { capsuleId, title, scheduledFor, timeRemaining }
});
```

**notification_received**
```javascript
socket.on('notification_received', (notification) => {
  // notification: Notification object
});
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

class TimeCapAPI {
  private baseURL = 'https://api.timecap.app';
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private get headers() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` })
    };
  }

  async login(email: string, password: string) {
    const response = await axios.post(`${this.baseURL}/api/auth/login`, {
      email,
      password
    });
    
    this.setToken(response.data.data.token);
    return response.data;
  }

  async getCapsules(params = {}) {
    const response = await axios.get(`${this.baseURL}/api/capsules`, {
      headers: this.headers,
      params
    });
    return response.data;
  }

  async createCapsule(capsuleData: any) {
    const response = await axios.post(`${this.baseURL}/api/capsules`, capsuleData, {
      headers: this.headers
    });
    return response.data;
  }
}
```

### Python

```python
import requests
from typing import Optional, Dict, Any

class TimeCapAPI:
    def __init__(self, base_url: str = "https://api.timecap.app"):
        self.base_url = base_url
        self.token: Optional[str] = None

    def set_token(self, token: str):
        self.token = token

    @property
    def headers(self) -> Dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    def login(self, email: str, password: str) -> Dict[str, Any]:
        response = requests.post(
            f"{self.base_url}/api/auth/login",
            json={"email": email, "password": password}
        )
        response.raise_for_status()
        data = response.json()
        self.set_token(data["data"]["token"])
        return data

    def get_capsules(self, **params) -> Dict[str, Any]:
        response = requests.get(
            f"{self.base_url}/api/capsules",
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        return response.json()
```

## Changelog

### v1.0.0 (2024-01-01)
- Initial API release
- Authentication endpoints
- Capsule CRUD operations
- Media upload functionality
- Notification system
- Legacy contacts management

---

For additional support or questions about the API, please contact our development team or refer to the project documentation.