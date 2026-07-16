import { supabase } from '../supabase';
import { typeToCategory, categoryToType } from './categories';
import type { Service } from './types';

// public.services columns: id, car_id, category_id, date, cost, description, created_at
// Fields without a dedicated column (mileage, notes, service items, next-service
// reminder hints) are encoded as JSON in the `description` text column.
type ServiceRow = {
  id: string;
  car_id: string;
  category_id: string;
  date: string | null;
  cost: number | null;
  description: string | null;
};

interface ServiceMeta {
  mileage?: number;
  notes?: string;
  serviceItems?: string[];
  nextServiceType?: 'date' | 'mileage';
  nextServiceValue?: string | number;
  reminderNote?: string;
}

function parseMeta(description: string | null): ServiceMeta {
  if (!description) return {};
  try {
    return (JSON.parse(description) as ServiceMeta) ?? {};
  } catch {
    return {}; // legacy / plain-text description
  }
}

function buildMeta(service: Omit<Service, 'id'>): ServiceMeta {
  return {
    mileage: service.mileage,
    notes: service.notes,
    serviceItems: service.serviceItems,
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
    type: categoryToType(row.category_id),
    date: row.date ?? '',
    mileage: meta.mileage ?? 0,
    cost: row.cost ?? 0,
    notes: meta.notes ?? '',
    serviceItems: meta.serviceItems,
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
      .select('id, car_id, category_id, date, cost, description')
      .in('car_id', carIds)
      .order('date', { ascending: false });

    if (error) {
      console.error('[services.listByCars] error:', error.message, '| code:', error.code);
      throw error;
    }
    return (data ?? []).map((r) => rowToService(r as ServiceRow));
  },

  async create(service: Omit<Service, 'id'>): Promise<void> {
    const { error } = await supabase.from('services').insert({
      car_id: service.carId,
      category_id: typeToCategory(service.type),
      date: service.date,
      cost: service.cost,
      description: JSON.stringify(buildMeta(service)),
    });
    if (error) {
      console.error('[services.create] error:', error.message, '| code:', error.code, '| details:', error.details);
      throw error;
    }
  },

  async update(id: string, service: Omit<Service, 'id'>): Promise<void> {
    const { error } = await supabase
      .from('services')
      .update({
        car_id: service.carId,
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
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) {
      console.error('[services.remove] error:', error.message, '| code:', error.code);
      throw error;
    }
  },
};
