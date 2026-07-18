import { supabase } from '../supabase';

// public.inspection_histories columns (after migration):
// id, car_id, start_date, end_date, status, notes, center, cost, created_at, updated_at
export interface InspectionHistory {
  id: string;
  carId: string;
  startDate: string | null;
  endDate: string | null;
  status: 'active' | 'expired' | 'pending' | null;
  notes: string | null;
  center: string | null;
  cost: number | null;
  createdAt: string;
}

type InspectionRow = {
  id: string;
  car_id: string;
  start_date: string | null;
  end_date: string | null;
  status: string | null;
  notes: string | null;
  center: string | null;
  cost: number | null;
  created_at: string;
};

function rowToInspection(row: InspectionRow): InspectionHistory {
  return {
    id: row.id,
    carId: row.car_id,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status as InspectionHistory['status'],
    notes: row.notes,
    center: row.center,
    cost: row.cost,
    createdAt: row.created_at,
  };
}

export const inspectionHistoriesService = {
  async listByCar(carId: string): Promise<InspectionHistory[]> {
    const { data, error } = await supabase
      .from('inspection_histories')
      .select('id, car_id, start_date, end_date, status, notes, center, cost, created_at')
      .eq('car_id', carId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[inspectionHistories.listByCar] error:', error.message, '| code:', error.code);
      throw error;
    }
    return (data ?? []).map((r) => rowToInspection(r as InspectionRow));
  },

  async create(record: Omit<InspectionHistory, 'id' | 'createdAt'>): Promise<void> {
    const { error } = await supabase.from('inspection_histories').insert({
      car_id: record.carId,
      start_date: record.startDate,
      end_date: record.endDate,
      status: record.status,
      notes: record.notes,
      center: record.center,
      cost: record.cost,
    });
    if (error) {
      console.error('[inspectionHistories.create] error:', error.message, '| code:', error.code);
      throw error;
    }
  },

  async update(id: string, record: Partial<Omit<InspectionHistory, 'id' | 'carId' | 'createdAt'>>): Promise<void> {
    const payload: Record<string, unknown> = {};
    if (record.startDate !== undefined) payload.start_date = record.startDate;
    if (record.endDate !== undefined) payload.end_date = record.endDate;
    if (record.status !== undefined) payload.status = record.status;
    if (record.notes !== undefined) payload.notes = record.notes;
    if (record.center !== undefined) payload.center = record.center;
    if (record.cost !== undefined) payload.cost = record.cost;

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
