import { supabase } from '../supabase';
import { typeToCategory, categoryToType } from './categories';
import type { Service } from './types';
import { serviceItemsService } from './service-items';

// Source-of-truth services columns: id, car_id, date, kilometer, cost, description, created_at, updated_at.
type ServiceRow = {
  id: string;
  car_id: string;
  date: string | null;
  kilometer: number | null;
  cost: number | null;
  description: string | null;
};

interface ServiceMeta {
  notes?: string;
  type?: Service['type'];
  nextServiceType?: 'date' | 'mileage';
  nextServiceValue?: string | number;
  reminderNote?: string;
}

function parseMeta(description: string | null): ServiceMeta {
  if (!description) return {};
  try {
    return (JSON.parse(description) as ServiceMeta) ?? {};
  } catch {
    return { notes: description };
  }
}

function buildMeta(service: Omit<Service, 'id'>): ServiceMeta {
  return {
    notes: service.notes,
    type: service.type,
    nextServiceType: service.nextServiceType,
    nextServiceValue: service.nextServiceValue,
    reminderNote: service.reminderNote,
  };
}

function rowToService(row: ServiceRow): Service {
  const meta = parseMeta(row.description);
  return {
    id: row.id,
    carId: row.car_id,
    type: meta.type ?? 'general',
    date: row.date ?? '',
    mileage: row.kilometer ?? 0,
    cost: row.cost ?? 0,
    notes: meta.notes ?? '',
    serviceItems: [],
    serviceItemLabels: {},
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
      .select('id, car_id, date, kilometer, cost, description')
      .in('car_id', carIds)
      .order('date', { ascending: false });

    if (error) {
      console.error('[services.listByCars] error:', error.message, '| code:', error.code);
      throw error;
    }

    const services = (data ?? []).map((r) => rowToService(r as ServiceRow));

    if (services.length > 0) {
      const serviceIds = services.map((s) => s.id);
      const junctionRows = await serviceItemsService.listByServices(serviceIds);
      const byService = new Map<string, { ids: string[]; labels: Record<string, string> }>();
      for (const row of junctionRows) {
        const existing = byService.get(row.serviceId) ?? { ids: [], labels: {} };
        if (!existing.ids.includes(row.itemId)) existing.ids.push(row.itemId);
        if (row.itemName) existing.labels[row.itemId] = row.itemName;
        byService.set(row.serviceId, existing);
      }
      for (const svc of services) {
        const items = byService.get(svc.id);
        svc.serviceItems = items?.ids ?? [];
        svc.serviceItemLabels = items?.labels ?? {};
        const rootItemId = typeToCategory(svc.type);
        if (svc.type === 'general' && svc.serviceItems.length > 0) {
          // Legacy rows may not have stored a type in description. Infer it from the first selected child.
          const first = junctionRows.find((row) => row.serviceId === svc.id && row.itemId === svc.serviceItems?.[0]);
          svc.type = categoryToType(first?.parentId ?? rootItemId);
        }
      }
    }

    return services;
  },

  async create(service: Omit<Service, 'id'>): Promise<string> {
    const { data, error } = await supabase
      .from('services')
      .insert({
        car_id: service.carId,
        date: service.date,
        kilometer: service.mileage,
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
    await serviceItemsService.replaceForService(serviceId, service.serviceItems ?? []);
    return serviceId;
  },

  async update(id: string, service: Omit<Service, 'id'>): Promise<void> {
    const { error } = await supabase
      .from('services')
      .update({
        car_id: service.carId,
        date: service.date,
        kilometer: service.mileage,
        cost: service.cost,
        description: JSON.stringify(buildMeta(service)),
      })
      .eq('id', id);

    if (error) {
      console.error('[services.update] error:', error.message, '| code:', error.code);
      throw error;
    }

    await serviceItemsService.replaceForService(id, service.serviceItems ?? []);
  },

  async remove(id: string): Promise<void> {
    const { error: junctionError } = await supabase.from('service_items').delete().eq('service_id', id);
    if (junctionError) {
      console.error('[services.remove] junction delete error:', junctionError.message, '| code:', junctionError.code);
      throw junctionError;
    }

    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) {
      console.error('[services.remove] error:', error.message, '| code:', error.code);
      throw error;
    }
  },
};
