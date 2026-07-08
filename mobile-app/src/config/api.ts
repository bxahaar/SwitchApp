// API Configuration
// Update these values with your Supabase project credentials

export const API_CONFIG = {
  // Replace with your Supabase project URL
  SUPABASE_URL: 'https://your-project-ref.supabase.co',
  
  // Replace with your Supabase anon key
  SUPABASE_ANON_KEY: 'your-anon-key-here',
  
  // API base URL
  BASE_URL: 'https://your-project-ref.supabase.co/functions/v1/make-server-cd2dec47',
  
  // Request timeout (30 seconds)
  TIMEOUT: 30000,
  
  // Enable logging in development
  ENABLE_LOGGING: __DEV__,
};

// Validate configuration
if (API_CONFIG.SUPABASE_URL.includes('your-project-ref')) {
  console.warn(
    '⚠️  Please update API_CONFIG in src/config/api.ts with your Supabase credentials'
  );
}

// API Endpoints
export const ENDPOINTS = {
  // Auth
  SEND_OTP: '/auth/send-otp',
  VERIFY_OTP: '/auth/verify-otp',
  REFRESH_TOKEN: '/auth/refresh',
  
  // Dashboard
  DASHBOARD: '/dashboard',
  
  // Cars
  CARS: '/cars',
  CAR_DETAIL: (id: string) => `/cars/${id}`,
  
  // Services
  SERVICES: (carId: string) => `/cars/${carId}/services`,
  SERVICE_DETAIL: (carId: string, serviceId: string) => `/cars/${carId}/services/${serviceId}`,
  
  // Reminders
  REMINDERS: (carId: string) => `/cars/${carId}/reminders`,
  REMINDERS_UPCOMING: '/reminders/upcoming',
  REMINDER_DETAIL: (carId: string, reminderId: string) => `/cars/${carId}/reminders/${reminderId}`,
  REMINDER_COMPLETE: (carId: string, reminderId: string) => `/cars/${carId}/reminders/${reminderId}/complete`,
  REMINDER_DISMISS: (carId: string, reminderId: string) => `/cars/${carId}/reminders/${reminderId}/dismiss`,
  
  // Categories
  SERVICE_CATEGORIES: '/service-categories',
  CATEGORY_CHECKLIST: (categoryId: string) => `/service-categories/${categoryId}/checklist`,
  
  // Insurance
  INSURANCE: (carId: string) => `/cars/${carId}/insurance`,
  INSURANCE_DETAIL: (carId: string, insuranceId: string) => `/cars/${carId}/insurance/${insuranceId}`,
  
  // Inspection
  INSPECTIONS: (carId: string) => `/cars/${carId}/inspections`,
  INSPECTION_DETAIL: (carId: string, inspectionId: string) => `/cars/${carId}/inspections/${inspectionId}`,
  
  // Insights
  INSIGHTS: '/insights',
  INSIGHT_DETAIL: (postId: string) => `/insights/${postId}`,
  
  // Profile
  PROFILE: '/profile',
};