import axios, { AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';
import type { 
  ApiResponse, 
  LoginRequest, 
  RegisterRequest, 
  AuthTokens,
  User 
} from '@timecap/types';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const authData = localStorage.getItem('timecap-auth');
    if (authData) {
      try {
        const { state } = JSON.parse(authData);
        const token = state?.tokens?.accessToken;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing auth data:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse>) => {
    const originalRequest = error.config;
    
    // Handle 401 errors (token expired)
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const authData = localStorage.getItem('timecap-auth');
        if (authData) {
          const { state } = JSON.parse(authData);
          const refreshToken = state?.tokens?.refreshToken;
          
          if (refreshToken) {
            const response = await axios.post('/api/auth/refresh', {
              refreshToken,
            });
            
            const newTokens = response.data.data;
            
            // Update stored tokens
            const updatedAuth = {
              ...JSON.parse(authData),
              state: {
                ...state,
                tokens: newTokens,
              },
            };
            localStorage.setItem('timecap-auth', JSON.stringify(updatedAuth));
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        localStorage.removeItem('timecap-auth');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Handle other errors
    const message = error.response?.data?.error?.message || 'An error occurred';
    
    // Don't show toast for certain errors
    const silentErrors = ['UNAUTHORIZED', 'TOKEN_EXPIRED'];
    const errorCode = error.response?.data?.error?.code;
    
    if (!silentErrors.includes(errorCode || '')) {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (data: LoginRequest): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> =>
    api.post('/auth/login', data),
    
  register: (data: RegisterRequest): Promise<ApiResponse> =>
    api.post('/auth/register', data),
    
  logout: (): Promise<ApiResponse> =>
    api.post('/auth/logout'),
    
  refreshToken: (refreshToken: string): Promise<ApiResponse<AuthTokens>> =>
    api.post('/auth/refresh', { refreshToken }),
    
  getCurrentUser: (): Promise<ApiResponse<User>> =>
    api.get('/auth/me'),
    
  verifyEmail: (token: string): Promise<ApiResponse> =>
    api.post('/auth/verify-email', { token }),
    
  resendVerification: (email: string): Promise<ApiResponse> =>
    api.post('/auth/resend-verification', { email }),
    
  forgotPassword: (email: string): Promise<ApiResponse> =>
    api.post('/auth/forgot-password', { email }),
    
  resetPassword: (token: string, password: string): Promise<ApiResponse> =>
    api.post('/auth/reset-password', { token, password }),
    
  changePassword: (currentPassword: string, newPassword: string): Promise<ApiResponse> =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
};

// Capsules API
export const capsulesApi = {
  getCapsules: (params?: any): Promise<ApiResponse> =>
    api.get('/capsules', { params }),
    
  getCapsule: (id: string): Promise<ApiResponse> =>
    api.get(`/capsules/${id}`),
    
  createCapsule: (data: any): Promise<ApiResponse> =>
    api.post('/capsules', data),
    
  updateCapsule: (id: string, data: any): Promise<ApiResponse> =>
    api.put(`/capsules/${id}`, data),
    
  deleteCapsule: (id: string): Promise<ApiResponse> =>
    api.delete(`/capsules/${id}`),
};

// Users API
export const usersApi = {
  updateProfile: (data: any): Promise<ApiResponse> =>
    api.put('/users/profile', data),
    
  updatePreferences: (data: any): Promise<ApiResponse> =>
    api.put('/users/preferences', data),
    
  getAnalytics: (): Promise<ApiResponse> =>
    api.get('/users/analytics'),
};

// Media API
export const mediaApi = {
  uploadMedia: (formData: FormData): Promise<ApiResponse> =>
    api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    
  getMedia: (id: string): Promise<ApiResponse> =>
    api.get(`/media/${id}`),
    
  deleteMedia: (id: string): Promise<ApiResponse> =>
    api.delete(`/media/${id}`),
};

// Notifications API
export const notificationsApi = {
  getNotifications: (): Promise<ApiResponse> =>
    api.get('/notifications'),
    
  markAsRead: (id: string): Promise<ApiResponse> =>
    api.put(`/notifications/${id}/read`),
    
  markAllAsRead: (): Promise<ApiResponse> =>
    api.put('/notifications/read-all'),
};

export default api;