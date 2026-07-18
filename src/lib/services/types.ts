// Domain types shared across the Supabase service layer and the React contexts.

export type ServiceType =
  | 'engine'
  | 'gearbox'
  | 'brakes'
  | 'tires'
  | 'battery'
  | 'general';

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
  date: string;
  mileage: number;
  cost: number;
  notes: string;
  serviceItems?: string[];
  nextServiceType?: 'date' | 'mileage';
  nextServiceValue?: string | number;
  reminderNote?: string;
}

export interface Reminder {
  id: string;
  carId: string;
  type: ServiceType;
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
