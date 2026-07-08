import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@/config/api';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/utils/storage';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Use anon key for public endpoints
      config.headers.Authorization = `Bearer ${API_CONFIG.SUPABASE_ANON_KEY}`;
    }
    
    // Log request in dev mode
    if (API_CONFIG.ENABLE_LOGGING) {
      console.log('📤 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Log response in dev mode
    if (API_CONFIG.ENABLE_LOGGING) {
      console.log('📥 API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    // Handle 401 - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await getRefreshToken();
        
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }
        
        // Refresh token
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              Authorization: `Bearer ${API_CONFIG.SUPABASE_ANON_KEY}`,
            },
          }
        );
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Store new tokens
        await setTokens(accessToken, newRefreshToken);
        
        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        console.error('❌ Token refresh failed:', refreshError);
        await clearTokens();
        
        // You might want to emit an event here to navigate to login
        // EventEmitter.emit('LOGOUT');
        
        return Promise.reject(refreshError);
      }
    }
    
    // Log error
    if (API_CONFIG.ENABLE_LOGGING) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
