// API Types

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
  stats?: CarStats;
  insurance?: InsuranceSummary;
  technicalInspection?: InspectionSummary;
}

export interface CarStats {
  totalServices: number;
  lastServiceDate: string | null;
  upcomingReminders: number;
}

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

export interface Dashboard {
  cars: Car[];
  upcomingReminders: Reminder[];
  recentServices: Service[];
  alerts: Alert[];
  stats: DashboardStats;
}

export interface Alert {
  type: 'insurance_expiring' | 'inspection_expiring';
  carId: string;
  message: string;
  severity: 'warning' | 'error';
  daysUntil: number;
}

export interface DashboardStats {
  totalCars: number;
  totalServices: number;
  totalCostThisYear: number;
  upcomingRemindersCount: number;
}

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

// Request types
export interface SendOTPRequest {
  phoneNumber: string;
  language: 'fa' | 'en';
}

export interface VerifyOTPRequest {
  phoneNumber: string;
  otpCode: string;
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

export interface CreateReminderRequest {
  categoryId?: string;
  title: string;
  description?: string;
  dueDate?: string;
  dueMileage?: number;
  notifyDaysBefore?: number;
  notifyKmBefore?: number;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  PhoneNumber: undefined;
  OTPVerification: {
    phoneNumber: string;
  };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Services: undefined;
  Cars: undefined;
  Settings: undefined;
};