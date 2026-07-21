import { supabase } from '../supabase';

// public.inspection_histories columns:
// id, car_id, start_date, end_date, created_at, updated_at
export interface InspectionHistory {
  id: string;
  carId: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

type InspectionRow = {
  id: string;
  car_id: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

function rowToInspection(row: InspectionRow): InspectionHistory {
  return {
    id: row.id,
    carId: row.car_id,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const inspectionHistoriesService = {
  async listByCar(carId: string): Promise<InspectionHistory[]> {
    const { data, error } = await supabase
      .from('inspection_histories')
      .select('id, car_id, start_date, end_date, created_at, updated_at')
      .eq('car_id', carId)
      .order('end_date', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('[inspectionHistories.listByCar] error:', error.message, '| code:', error.code);
      throw error;
    }
    return (data ?? []).map((r) => rowToInspection(r as InspectionRow));
  },

  async create(record: Omit<InspectionHistory, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const { error } = await supabase.from('inspection_histories').insert({
      car_id: record.carId,
      start_date: record.startDate,
      end_date: record.endDate,
    });
    if (error) {
      console.error('[inspectionHistories.create] error:', error.message, '| code:', error.code);
      throw error;
    }
  },

  async update(id: string, record: Partial<Omit<InspectionHistory, 'id' | 'carId' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const payload: Record<string, unknown> = {};
    if (record.startDate !== undefined) payload.start_date = record.startDate;
    if (record.endDate !== undefined) payload.end_date = record.endDate;
    if (Object.keys(payload).length === 0) return;
    const { error } = await supabase.from('inspection_histories').update(payload).eq('id', id);
    if (error) {
      console.error('[inspectionHistories.update] error:', error.message, '| code:', error.code);
      throw error;
    }
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('inspection_histories').delete().eq('id', id);
    if (error) {
      console.error('[inspectionHistories.remove] error:', error.message, '| code:', error.code);
      throw error;
    }
  },
};
