import type { ServiceType } from './types';

// Bidirectional mapping between the app's service-type enum and the seeded
// system categories in public.categories (see supabase/seed_categories.sql).
// The categories table must be seeded with these fixed UUIDs, otherwise
// inserts into services/reminders fail the category_id foreign key.
export const TYPE_TO_CATEGORY_ID: Record<ServiceType, string> = {
  engine: '10000000-0000-0000-0000-000000000001',
  gearbox: '10000000-0000-0000-0000-000000000002',
  brakes: '10000000-0000-0000-0000-000000000003',
  tires: '10000000-0000-0000-0000-000000000004',
  battery: '10000000-0000-0000-0000-000000000005',
  general: '10000000-0000-0000-0000-000000000006',
};

const CATEGORY_ID_TO_TYPE: Record<string, ServiceType> = Object.fromEntries(
  Object.entries(TYPE_TO_CATEGORY_ID).map(([k, v]) => [v, k as ServiceType]),
) as Record<string, ServiceType>;

export function typeToCategory(type: ServiceType): string {
  return TYPE_TO_CATEGORY_ID[type] ?? TYPE_TO_CATEGORY_ID.general;
}

export function categoryToType(categoryId: string | null | undefined): ServiceType {
  return (categoryId && CATEGORY_ID_TO_TYPE[categoryId]) || 'general';
}
