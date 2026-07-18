// Supabase data-access layer.
// All Supabase calls flow through these services — never call supabase.from() directly in components or contexts.

export * from './types';
export { carsService } from './cars';
export { servicesService } from './services';
export { remindersService } from './reminders';
export { usersService } from './users';
export { itemsService } from './items';
export type { Item } from './items';
export { serviceItemsService } from './service-items';
export type { ServiceItem } from './service-items';
export { inspectionHistoriesService } from './inspection-histories';
export type { InspectionHistory } from './inspection-histories';
export { insuranceHistoriesService } from './insurance-histories';
export type { InsuranceHistory } from './insurance-histories';
export { TYPE_TO_CATEGORY_ID, typeToCategory, categoryToType } from './categories';
