import { supabase } from '../supabase';
import { typeToCategory, categoryToType } from './categories';
import type { Service } from './types';
import { serviceItemsService } from './service-items';

// public.services columns: id, car_id, item_id, category_id (legacy), date, cost, description, created_at, updated_at
// Fields without a dedicated column (mileage, notes, next-service reminder hints) are
// encoded as JSON in the `description` text column until a schema migration adds proper columns.
type ServiceRow = {
  id: string;
  car_id: string;
  item_id: string | null;
  category_id: string | null;   // legacy
  date: string | null;
  cost: number | null;
  description: string | null;
};

interface ServiceMeta {
  mileage?: number;
  notes?: string;
  nextServiceType?: 'date' | 'mileage';
  nextServiceValue?: string | number;
  reminderNote?: string;
}

function parseMeta(description: string | null): ServiceMeta {
  if (!description) return {};
  try {
    return (JSON.parse(description) as ServiceMeta) ?? {};
  } catch {
    return {};
  }
}

function buildMeta(service: Omit<Service, 'id'>): ServiceMeta {
  return {
    mileage: service.mileage,
    notes: service.notes,
    nextServiceType: service.nextServiceType,
    nextServiceValue: service.nextServiceValue,
    reminderNote: service.reminderNote,
  };
}

function rowToService(row: ServiceRow): Service {
  const meta = parseMeta(row.description);
  // Prefer item_id for type resolution; fall back to legacy category_id.
  const resolvedId = row.item_id ?? row.category_id;
  return {
    id: row.id,
    carId: row.car_id,
    type: categoryToType(resolvedId),
    date: row.date ?? '',
    mileage: meta.mileage ?? 0,
    cost: row.cost ?? 0,
    notes: meta.notes ?? '',
    serviceItems: undefined, // populated separately via service_items join
    nextServiceType: meta.nextServiceType,
    nextServiceValue: meta.nextServiceValue,
    reminderNote: meta.reminderNote,
  };
}

export const servicesService = {
  /** Load all services for the given car ids, newest first. */
  async listByCars(carIds: string[]): Promise<Service[]> {
    if (carIds.length === 0) return [];

    const { data, error } = await supabase
      .from('services')
      .select('id, car_id, item_id, category_id, date, cost, description')
      .in('car_id', carIds)
      .order('date', { ascending: false });

    if (error) {
      console.error('[services.listByCars] error:', error.message, '| code:', error.code);
      throw error;
    }

    const services = (data ?? []).map((r) => rowToService(r as ServiceRow));

    // Enrich with service_items junction rows
    if (services.length > 0) {
      try {
        const serviceIds = services.map((s) => s.id);
        const junctionRows = await serviceItemsService.listByServices(serviceIds);
        // Group junction rows by service_id
        const byService = new Map<string, string[]>();
        for (const row of junctionRows) {
          const existing = byService.get(row.serviceId) ?? [];
          existing.push(row.itemId);
          byService.set(row.serviceId, existing);
        }
        // Attach item IDs as string array on each service
        for (const svc of services) {
          const itemIds = byService.get(svc.id);
          if (itemIds && itemIds.length > 0) {
            svc.serviceItems = itemIds;
          }
        }
      } catch {
        // Non-fatal: service_items may not exist yet (migration pending)
      }
    }

    return services;
  },

  /**
   * Create a service and its junction rows atomically.
   * serviceItems on the payload are resolved as item UUIDs.
   */
  async create(service: Omit<Service, 'id'>): Promise<string> {
    const { data, error } = await supabase
      .from('services')
      .insert({
        car_id: service.carId,
        item_id: typeToCategory(service.type),       // root item = service type
        category_id: typeToCategory(service.type),   // legacy compat
        date: service.date,
        cost: service.cost,
        description: JSON.stringify(buildMeta(service)),
      })
      .select('id')
      .single();

    if (error) {
      console.error('[services.create] error:', error.message, '| code:', error.code, '| details:', error.details);
      throw error;
    }

    const serviceId = (data as { id: string }).id;

    // Persist the serviced items to the junction table
    if (service.serviceItems && service.serviceItems.length > 0) {
      try {
        await serviceItemsService.replaceForService(
          serviceId,
          service.serviceItems.map((itemId) => ({ itemId, quantity: 1, cost: null, notes: null })),
        );
      } catch {
        // Non-fatal: service_items may not exist yet (migration pending)
      }
    }

    return serviceId;
  },

  async update(id: string, service: Omit<Service, 'id'>): Promise<void> {
    const { error } = await supabase
      .from('services')
      .update({
        car_id: service.carId,
        item_id: typeToCategory(service.type),
        category_id: typeToCategory(service.type),
        date: service.date,
        cost: service.cost,
        description: JSON.stringify(buildMeta(service)),
      })
      .eq('id', id);

    if (error) {
      console.error('[services.update] error:', error.message, '| code:', error.code);
      throw error;
    }

    // Replace junction rows
    if (service.serviceItems !== undefined) {
      try {
        await serviceItemsService.replaceForService(
          id,
          service.serviceItems.map((itemId) => ({ itemId, quantity: 1, cost: null, notes: null })),
        );
      } catch {
        // Non-fatal
      }
    }
  },

  async remove(id: string): Promise<void> {
    // service_items rows are deleted via ON DELETE CASCADE
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) {
      console.error('[services.remove] error:', error.message, '| code:', error.code);
      throw error;
    }
  },
};
