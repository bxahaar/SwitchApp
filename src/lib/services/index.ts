// Reusable Supabase data-access layer. Contexts and components should read/write
// through these services rather than calling `supabase.from(...)` directly.
export * from './types';
export { carsService } from './cars';
export { servicesService } from './services';
export { remindersService } from './reminders';
export { usersService } from './users';
export { inspectionHistoriesService } from './inspection-histories';
export { insuranceHistoriesService } from './insurance-histories';
export type { InspectionHistory } from './inspection-histories';
export type { InsuranceHistory } from './insurance-histories';
export { TYPE_TO_CATEGORY_ID, typeToCategory, categoryToType } from './categories';
