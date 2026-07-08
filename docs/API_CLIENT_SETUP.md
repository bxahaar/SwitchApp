# API Client Setup & Code Snippets

Ready-to-use code for integrating with the backend API.

---

## Table of Contents

1. [Environment Configuration](#1-environment-configuration)
2. [API Client Setup](#2-api-client-setup)
3. [Authentication Service](#3-authentication-service)
4. [API Services](#4-api-services)
5. [React Hooks](#5-react-hooks)
6. [Utility Functions](#6-utility-functions)
7. [TypeScript Types](#7-typescript-types)

---

## 1. Environment Configuration

### `.env` File

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
API_BASE_URL=https://your-project-ref.supabase.co/functions/v1/make-server-cd2dec47

# Optional
API_TIMEOUT=30000
ENABLE_API_LOGGING=true
```

### `config/api.ts`

```typescript
import Config from 'react-native-config';

export const API_CONFIG = {
  BASE_URL: Config.API_BASE_URL || 'http://localhost:54321/functions/v1/make-server-cd2dec47',
  SUPABASE_URL: Config.SUPABASE_URL,
  SUPABASE_ANON_KEY: Config.SUPABASE_ANON_KEY,
  TIMEOUT: parseInt(Config.API_TIMEOUT || '30000', 10),
  ENABLE_LOGGING: Config.ENABLE_API_LOGGING === 'true',
};
```

---

## 2. API Client Setup

### `services/api/client.ts`

```typescript
import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import { API_CONFIG } from '@/config/api';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/utils/auth';
import { logger } from '@/utils/logger';

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
      logger.debug('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    logger.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    // Log response in dev mode
    if (API_CONFIG.ENABLE_LOGGING) {
      logger.debug('API Response:', {
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
        logger.error('Token refresh failed:', refreshError);
        await clearTokens();
        
        // Navigate to login (you'll need to handle this based on your navigation setup)
        // navigationRef.current?.reset({ index: 0, routes: [{ name: 'Login' }] });
        
        return Promise.reject(refreshError);
      }
    }
    
    // Log error
    logger.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 3. Authentication Service

### `services/api/auth.service.ts`

```typescript
import apiClient from './client';
import { setTokens, clearTokens } from '@/utils/auth';

export interface SendOTPRequest {
  phoneNumber: string;
  language: 'fa' | 'en';
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
}

export interface VerifyOTPRequest {
  phoneNumber: string;
  otpCode: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    phone: string;
  };
}

class AuthService {
  /**
   * Send OTP to phone number
   */
  async sendOTP(data: SendOTPRequest): Promise<SendOTPResponse> {
    const response = await apiClient.post<SendOTPResponse>('/auth/send-otp', data);
    return response.data;
  }
  
  /**
   * Verify OTP and login
   */
  async verifyOTP(data: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    const response = await apiClient.post<VerifyOTPResponse>('/auth/verify-otp', data);
    
    // Store tokens
    await setTokens(response.data.accessToken, response.data.refreshToken);
    
    return response.data;
  }
  
  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await clearTokens();
  }
}

export default new AuthService();
```

---

## 4. API Services

### `services/api/dashboard.service.ts`

```typescript
import apiClient from './client';
import { Dashboard } from '@/types/api';

class DashboardService {
  /**
   * Get dashboard data
   */
  async getDashboard(): Promise<Dashboard> {
    const response = await apiClient.get<Dashboard>('/dashboard');
    return response.data;
  }
}

export default new DashboardService();
```

### `services/api/cars.service.ts`

```typescript
import apiClient from './client';
import { Car, CreateCarRequest, UpdateCarRequest } from '@/types/api';

class CarsService {
  /**
   * Get all cars
   */
  async getCars(includeInactive = false): Promise<Car[]> {
    const response = await apiClient.get<{ cars: Car[] }>('/cars', {
      params: { includeInactive },
    });
    return response.data.cars;
  }
  
  /**
   * Get single car
   */
  async getCar(carId: string): Promise<Car> {
    const response = await apiClient.get<Car>(`/cars/${carId}`);
    return response.data;
  }
  
  /**
   * Create new car
   */
  async createCar(data: CreateCarRequest): Promise<Car> {
    const response = await apiClient.post<{ success: boolean; car: Car }>('/cars', data);
    return response.data.car;
  }
  
  /**
   * Update car
   */
  async updateCar(carId: string, data: UpdateCarRequest): Promise<Car> {
    const response = await apiClient.put<{ success: boolean; car: Car }>(`/cars/${carId}`, data);
    return response.data.car;
  }
  
  /**
   * Delete car
   */
  async deleteCar(carId: string, permanent = false): Promise<void> {
    await apiClient.delete(`/cars/${carId}`, {
      params: { permanent },
    });
  }
}

export default new CarsService();
```

### `services/api/services.service.ts`

```typescript
import apiClient from './client';
import { Service, CreateServiceRequest, UpdateServiceRequest } from '@/types/api';

interface GetServicesParams {
  carId: string;
  limit?: number;
  offset?: number;
  category?: string;
  fromDate?: string;
  toDate?: string;
}

class ServicesService {
  /**
   * Get service history
   */
  async getServices(params: GetServicesParams): Promise<{
    services: Service[];
    pagination: { total: number; limit: number; offset: number };
  }> {
    const response = await apiClient.get(`/cars/${params.carId}/services`, {
      params: {
        limit: params.limit,
        offset: params.offset,
        category: params.category,
        fromDate: params.fromDate,
        toDate: params.toDate,
      },
    });
    return response.data;
  }
  
  /**
   * Get single service
   */
  async getService(carId: string, serviceId: string): Promise<Service> {
    const response = await apiClient.get<Service>(`/cars/${carId}/services/${serviceId}`);
    return response.data;
  }
  
  /**
   * Create service
   */
  async createService(carId: string, data: CreateServiceRequest): Promise<Service> {
    const response = await apiClient.post<{ success: boolean; service: Service }>(
      `/cars/${carId}/services`,
      data
    );
    return response.data.service;
  }
  
  /**
   * Update service
   */
  async updateService(
    carId: string,
    serviceId: string,
    data: UpdateServiceRequest
  ): Promise<Service> {
    const response = await apiClient.put<{ success: boolean; service: Service }>(
      `/cars/${carId}/services/${serviceId}`,
      data
    );
    return response.data.service;
  }
  
  /**
   * Delete service
   */
  async deleteService(carId: string, serviceId: string): Promise<void> {
    await apiClient.delete(`/cars/${carId}/services/${serviceId}`);
  }
}

export default new ServicesService();
```

### `services/api/reminders.service.ts`

```typescript
import apiClient from './client';
import { Reminder, CreateReminderRequest } from '@/types/api';

class RemindersService {
  /**
   * Get reminders for a car
   */
  async getReminders(carId: string, status?: string): Promise<Reminder[]> {
    const response = await apiClient.get<{ reminders: Reminder[] }>(
      `/cars/${carId}/reminders`,
      { params: { status } }
    );
    return response.data.reminders;
  }
  
  /**
   * Get all upcoming reminders
   */
  async getUpcomingReminders(limit = 50): Promise<Reminder[]> {
    const response = await apiClient.get<{ reminders: Reminder[] }>('/reminders/upcoming', {
      params: { limit },
    });
    return response.data.reminders;
  }
  
  /**
   * Create reminder
   */
  async createReminder(carId: string, data: CreateReminderRequest): Promise<Reminder> {
    const response = await apiClient.post<{ success: boolean; reminder: Reminder }>(
      `/cars/${carId}/reminders`,
      data
    );
    return response.data.reminder;
  }
  
  /**
   * Complete reminder
   */
  async completeReminder(
    carId: string,
    reminderId: string,
    serviceId?: string
  ): Promise<Reminder> {
    const response = await apiClient.post<{ success: boolean; reminder: Reminder }>(
      `/cars/${carId}/reminders/${reminderId}/complete`,
      { serviceId }
    );
    return response.data.reminder;
  }
  
  /**
   * Dismiss reminder
   */
  async dismissReminder(carId: string, reminderId: string): Promise<Reminder> {
    const response = await apiClient.post<{ success: boolean; reminder: Reminder }>(
      `/cars/${carId}/reminders/${reminderId}/dismiss`
    );
    return response.data.reminder;
  }
  
  /**
   * Delete reminder
   */
  async deleteReminder(carId: string, reminderId: string): Promise<void> {
    await apiClient.delete(`/cars/${carId}/reminders/${reminderId}`);
  }
}

export default new RemindersService();
```

### `services/api/categories.service.ts`

```typescript
import apiClient from './client';
import { ServiceCategory, ChecklistItem } from '@/types/api';

class CategoriesService {
  /**
   * Get service categories
   */
  async getCategories(language: 'fa' | 'en' = 'fa'): Promise<ServiceCategory[]> {
    const response = await apiClient.get<{ categories: ServiceCategory[] }>(
      '/service-categories',
      { params: { language } }
    );
    return response.data.categories;
  }
  
  /**
   * Get checklist items for category
   */
  async getChecklistItems(
    categoryId: string,
    language: 'fa' | 'en' = 'fa'
  ): Promise<ChecklistItem[]> {
    const response = await apiClient.get<{ items: ChecklistItem[] }>(
      `/service-categories/${categoryId}/checklist`,
      { params: { language } }
    );
    return response.data.items;
  }
}

export default new CategoriesService();
```

---

## 5. React Hooks

### `hooks/useApi.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import { AxiosError } from 'axios';

interface UseApiOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseApiReturn<T, P extends any[]> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: P) => Promise<T | undefined>;
  reset: () => void;
}

export function useApi<T, P extends any[] = []>(
  apiFunction: (...args: P) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T, P> {
  const { immediate = false, onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);
  
  const execute = useCallback(
    async (...args: P): Promise<T | undefined> => {
      setLoading(true);
      setError(null);
      
      try {
        const result = await apiFunction(...args);
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err as AxiosError;
        const appError = new Error(
          error.response?.data?.error || error.message || 'An error occurred'
        );
        setError(appError);
        onError?.(appError);
        throw appError;
      } finally {
        setLoading(false);
      }
    },
    [apiFunction, onSuccess, onError]
  );
  
  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);
  
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []);
  
  return { data, loading, error, execute, reset };
}
```

### `hooks/useDashboard.ts`

```typescript
import { useApi } from './useApi';
import DashboardService from '@/services/api/dashboard.service';
import { Dashboard } from '@/types/api';

export function useDashboard() {
  return useApi<Dashboard>(
    () => DashboardService.getDashboard(),
    { immediate: true }
  );
}
```

### `hooks/useCars.ts`

```typescript
import { useApi } from './useApi';
import CarsService from '@/services/api/cars.service';
import { Car } from '@/types/api';

export function useCars(includeInactive = false) {
  return useApi<Car[]>(
    () => CarsService.getCars(includeInactive),
    { immediate: true }
  );
}

export function useCar(carId: string | null) {
  return useApi<Car>(
    () => CarsService.getCar(carId!),
    { immediate: !!carId }
  );
}
```

### `hooks/useServices.ts`

```typescript
import { useApi } from './useApi';
import ServicesService from '@/services/api/services.service';
import { Service } from '@/types/api';

interface UseServicesParams {
  carId: string;
  limit?: number;
  offset?: number;
  category?: string;
  fromDate?: string;
  toDate?: string;
}

export function useServices(params: UseServicesParams) {
  return useApi<{
    services: Service[];
    pagination: { total: number; limit: number; offset: number };
  }>(
    () => ServicesService.getServices(params),
    { immediate: !!params.carId }
  );
}
```

---

## 6. Utility Functions

### `utils/auth.ts`

```typescript
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export async function getAccessToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
}

export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
```

### `utils/persianNumber.ts`

```typescript
/**
 * Convert English/Arabic numerals to Persian
 */
export function toPersianNumber(input: string | number): string {
  const str = String(input);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  
  return str.replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit, 10)]);
}

/**
 * Convert Persian/Arabic numerals to English
 */
export function toEnglishNumber(input: string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  
  let result = input;
  
  // Persian to English
  persianDigits.forEach((digit, index) => {
    result = result.replace(new RegExp(digit, 'g'), String(index));
  });
  
  // Arabic to English
  arabicDigits.forEach((digit, index) => {
    result = result.replace(new RegExp(digit, 'g'), String(index));
  });
  
  return result;
}

/**
 * Normalize phone number input
 */
export function normalizePhoneNumber(input: string): string {
  // Convert to English numbers
  let normalized = toEnglishNumber(input);
  
  // Remove non-digits except +
  normalized = normalized.replace(/[^\d+]/g, '');
  
  // Add +98 if not present
  if (!normalized.startsWith('+')) {
    if (normalized.startsWith('0')) {
      normalized = '+98' + normalized.slice(1);
    } else {
      normalized = '+98' + normalized;
    }
  }
  
  return normalized;
}
```

### `utils/jalaliDate.ts`

```typescript
import moment from 'moment-jalaali';

/**
 * Format date to Persian calendar
 */
export function formatPersianDate(date: string | Date, format = 'jD jMMMM jYYYY'): string {
  return moment(date).format(format);
}

/**
 * Parse Jalali date to ISO string
 */
export function jalaliToISO(jalaliDate: string): string {
  return moment(jalaliDate, 'jYYYY/jMM/jDD').toISOString();
}

/**
 * Get Persian month name
 */
export function getPersianMonth(monthNumber: number): string {
  const months = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  return months[monthNumber - 1];
}
```

### `utils/price.ts`

```typescript
import { toPersianNumber } from './persianNumber';

/**
 * Format price with currency
 */
export function formatPrice(amount: number, currency: 'toman' | 'rial' = 'toman'): string {
  const formatted = new Intl.NumberFormat('fa-IR').format(amount);
  const persianFormatted = toPersianNumber(formatted);
  
  return currency === 'toman' 
    ? `${persianFormatted} تومان`
    : `${persianFormatted} ریال`;
}

/**
 * Format mileage
 */
export function formatMileage(km: number): string {
  const formatted = new Intl.NumberFormat('fa-IR').format(km);
  return `${toPersianNumber(formatted)} کیلومتر`;
}
```

---

## 7. TypeScript Types

### `types/api.ts`

```typescript
// Auth
export interface User {
  id: string;
  phone: string;
}

export interface UserProfile {
  id: string;
  phoneNumber: string;
  displayName: string;
  preferredLanguage: 'fa' | 'en';
  themePreference: 'light' | 'dark';
  distanceUnit: 'km' | 'mi';
  currency: 'toman';
  pushNotificationToken: string | null;
  createdAt: string;
  updatedAt: string;
}

// Cars
export interface Car {
  id: string;
  userId: string;
  brand: string;
  model: string;
  year?: number;
  color?: string;
  licensePlate?: string;
  vin?: string;
  currentMileage?: number;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stats?: {
    totalServices: number;
    lastServiceDate: string | null;
    upcomingReminders: number;
  };
  insurance?: InsuranceSummary;
  technicalInspection?: InspectionSummary;
}

export interface CreateCarRequest {
  brand: string;
  model: string;
  year?: number;
  color?: string;
  licensePlate?: string;
  vin?: string;
  currentMileage?: number;
}

export type UpdateCarRequest = Partial<CreateCarRequest>;

// Service Categories
export interface ServiceCategory {
  id: string;
  key: string;
  nameEn: string;
  nameFa: string;
  icon: string;
  color: string;
  displayOrder: number;
  isActive: boolean;
}

export interface ChecklistItem {
  id: string;
  categoryId: string;
  nameEn: string;
  nameFa: string;
  displayOrder: number;
  isActive: boolean;
}

// Services
export interface Service {
  id: string;
  carId: string;
  categoryId: string;
  serviceDate: string;
  mileage?: number;
  cost?: number;
  currency: string;
  description?: string;
  notes?: string;
  serviceProvider?: string;
  serviceProviderPhone?: string;
  category?: ServiceCategory;
  items: ServiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceItem {
  id: string;
  checklistItemId?: string;
  customItemName?: string;
  name: string;
  isChecked: boolean;
  notes?: string;
}

export interface CreateServiceRequest {
  categoryId: string;
  serviceDate: string;
  mileage?: number;
  cost?: number;
  currency?: string;
  description?: string;
  notes?: string;
  serviceProvider?: string;
  serviceProviderPhone?: string;
  items: Array<{
    checklistItemId?: string;
    customItemName?: string;
    isChecked: boolean;
    notes?: string;
  }>;
}

export type UpdateServiceRequest = Partial<CreateServiceRequest>;

// Reminders
export interface Reminder {
  id: string;
  carId: string;
  categoryId?: string;
  title: string;
  description?: string;
  dueDate?: string;
  dueMileage?: number;
  status: 'upcoming' | 'completed' | 'dismissed' | 'overdue';
  notifyDaysBefore: number;
  notifyKmBefore: number;
  lastNotificationSentAt?: string;
  completedAt?: string;
  completedServiceId?: string;
  daysUntilDue?: number;
  kmUntilDue?: number;
  isOverdue: boolean;
  category?: ServiceCategory;
  car?: {
    id: string;
    brand: string;
    model: string;
    licensePlate: string;
    currentMileage: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderRequest {
  categoryId?: string;
  title: string;
  description?: string;
  dueDate?: string;
  dueMileage?: number;
  notifyDaysBefore?: number;
  notifyKmBefore?: number;
}

// Insurance
export interface InsuranceRecord {
  id: string;
  carId: string;
  insuranceType: string;
  insuranceCompany: string;
  policyNumber?: string;
  startDate: string;
  endDate: string;
  premiumAmount?: number;
  currency: string;
  documentUrl?: string;
  isCurrent: boolean;
  notes?: string;
  daysUntilExpiry: number;
  isExpiringSoon: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InsuranceSummary {
  endDate: string;
  daysUntilExpiry: number;
  isExpiringSoon: boolean;
}

// Technical Inspection
export interface InspectionRecord {
  id: string;
  carId: string;
  inspectionCenter: string;
  certificateNumber?: string;
  inspectionDate: string;
  expiryDate: string;
  passed: boolean;
  notes?: string;
  documentUrl?: string;
  isCurrent: boolean;
  daysUntilExpiry: number;
  isExpiringSoon: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InspectionSummary {
  expiryDate: string;
  daysUntilExpiry: number;
  isExpiringSoon: boolean;
}

// Dashboard
export interface Dashboard {
  cars: Car[];
  upcomingReminders: Reminder[];
  recentServices: Service[];
  alerts: Alert[];
  stats: {
    totalCars: number;
    totalServices: number;
    totalCostThisYear: number;
    upcomingRemindersCount: number;
  };
}

export interface Alert {
  type: 'insurance_expiring' | 'inspection_expiring';
  carId: string;
  message: string;
  severity: 'warning' | 'error';
  daysUntil: number;
}

// Blog
export interface BlogPost {
  id: string;
  titleEn: string;
  titleFa: string;
  contentEn: string;
  contentFa: string;
  coverImageUrl?: string;
  videoUrl?: string;
  category: string;
  tags: string[];
  featured: boolean;
  author: string;
  publishedAt: string;
}

// Notifications
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  referenceType?: string;
  referenceId?: string;
  isRead: boolean;
  sentAt: string;
  readAt?: string;
  pushSent: boolean;
  pushSentAt?: string;
}
```

---

## 8. Usage Examples

### Authentication

```typescript
import AuthService from '@/services/api/auth.service';
import { normalizePhoneNumber } from '@/utils/persianNumber';

// Send OTP
const handleSendOTP = async () => {
  try {
    const response = await AuthService.sendOTP({
      phoneNumber: normalizePhoneNumber(phoneNumber),
      language: 'fa',
    });
    console.log('OTP sent:', response.message);
  } catch (error) {
    console.error('Failed to send OTP:', error);
  }
};

// Verify OTP
const handleVerifyOTP = async () => {
  try {
    const response = await AuthService.verifyOTP({
      phoneNumber: normalizePhoneNumber(phoneNumber),
      otpCode: toEnglishNumber(otpCode),
    });
    console.log('Logged in:', response.user);
    // Navigate to main app
  } catch (error) {
    console.error('Failed to verify OTP:', error);
  }
};
```

### Dashboard with Hook

```typescript
import { useDashboard } from '@/hooks/useDashboard';

function DashboardScreen() {
  const { data, loading, error, execute } = useDashboard();
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorView error={error} onRetry={execute} />;
  if (!data) return null;
  
  return (
    <ScrollView refreshControl={
      <RefreshControl refreshing={loading} onRefresh={execute} />
    }>
      <CarCarousel data={data.cars} />
      <UpcomingReminders reminders={data.upcomingReminders} />
      <RecentServices services={data.recentServices} />
    </ScrollView>
  );
}
```

### Create Service

```typescript
import ServicesService from '@/services/api/services.service';
import { formatDate } from '@/utils/date';
import { toEnglishNumber } from '@/utils/persianNumber';

const handleCreateService = async () => {
  try {
    const service = await ServicesService.createService(carId, {
      categoryId: selectedCategory.id,
      serviceDate: formatDate(serviceDate), // "2024-01-10"
      mileage: parseInt(toEnglishNumber(mileageInput), 10),
      cost: parseInt(toEnglishNumber(costInput), 10),
      currency: 'toman',
      items: [
        // Predefined items
        ...checklistItems
          .filter(item => item.isChecked)
          .map(item => ({
            checklistItemId: item.id,
            isChecked: true,
          })),
        // Custom items
        ...customItems.map(item => ({
          customItemName: item.name,
          isChecked: item.isChecked,
        })),
      ],
    });
    
    console.log('Service created:', service);
    navigation.goBack();
  } catch (error) {
    console.error('Failed to create service:', error);
  }
};
```

---

This setup provides a complete, production-ready API client for your mobile app! 🚀
