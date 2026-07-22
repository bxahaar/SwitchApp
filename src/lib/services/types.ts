// Domain types shared across the Supabase service layer and the React contexts.

export type ServiceType = string;

export interface Car {
  id: string;
  name: string;
  licensePlate: string;
  // Insurance / inspection dates: held in memory only.
  // These are written via insurance_histories / inspection_histories tables.
  // The "active" record's dates are cached here for fast display.
  insuranceStartDate?: string;
  insuranceEndDate?: string;
  technicalInspectionStartDate?: string;
  technicalInspectionEndDate?: string;
}

export interface Service {
  id: string;
  carId: string;
  type: ServiceType;
  typeName?: string;
  date: string;
  mileage: number;
  cost: number;
  notes: string;
  serviceItems?: string[];
  serviceItemLabels?: Record<string, string>;
  nextServiceType?: 'date' | 'mileage';
  nextServiceValue?: string | number;
  reminderNote?: string;
}

export interface Reminder {
  id: string;
  carId: string;
  type: ServiceType;
  typeName?: string;
  reminderType: 'date' | 'mileage';
  reminderValue: string | number;
  reminderNote?: string;
}

export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
}
