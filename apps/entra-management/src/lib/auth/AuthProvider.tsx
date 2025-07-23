import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';

interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isAuthenticated = !!user && !!token;

  // Initialize auth state from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('entra_token');
    const savedUser = localStorage.getItem('entra_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        
        // Set axios default header
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('entra_token');
        localStorage.removeItem('entra_user');
      }
    }
    
    setIsLoading(false);
  }, []);

  // Handle authentication callback
  useEffect(() => {
    const handleAuthCallback = async () => {
      if (router.pathname === '/auth/callback') {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const state = urlParams.get('state');

        if (code && state === 'entra-management-app') {
          try {
            setIsLoading(true);
            const response = await axios.post('/api/auth/callback', {
              code,
              state
            });

            if (response.data.success) {
              const { token: newToken, user: newUser } = response.data.data;
              
              setToken(newToken);
              setUser(newUser);
              
              // Save to localStorage
              localStorage.setItem('entra_token', newToken);
              localStorage.setItem('entra_user', JSON.stringify(newUser));
              
              // Set axios default header
              axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
              
              toast.success('Successfully logged in!');
              router.push('/dashboard');
            }
          } catch (error: any) {
            console.error('Authentication error:', error);
            toast.error(error.response?.data?.error?.message || 'Authentication failed');
            router.push('/login');
          } finally {
            setIsLoading(false);
          }
        }
      }
    };

    handleAuthCallback();
  }, [router]);

  const login = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/auth/login-url');
      
      if (response.data.success) {
        window.location.href = response.data.data.authUrl;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to initiate login');
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('entra_token');
    localStorage.removeItem('entra_user');
    delete axios.defaults.headers.common['Authorization'];
    
    toast.success('Logged out successfully');
    router.push('/login');
  };

  const refreshToken = async (): Promise<void> => {
    try {
      if (!token) return;

      const response = await axios.post('/api/auth/refresh', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const newToken = response.data.data.token;
        setToken(newToken);
        localStorage.setItem('entra_token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      }
    } catch (error: any) {
      console.error('Token refresh error:', error);
      // If refresh fails, logout the user
      logout();
    }
  };

  // Set up axios interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && token) {
          try {
            await refreshToken();
            // Retry the original request
            return axios.request(error.config);
          } catch (refreshError) {
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [token]);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};