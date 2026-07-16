// Domain types shared across the Supabase service layer and the React contexts.
// These describe the *application* shape of each entity, not the raw DB row.

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
  // Insurance / inspection dates have no column in the current DB schema and no
  // dedicated table exists. They are held in memory only. See services/cars.ts.
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
