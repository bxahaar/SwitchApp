import { supabase } from '../supabase';

// public.insurance_histories columns (after migration):
// id, car_id, start_date, end_date, status, notes, provider, policy_number, cost, created_at, updated_at
export interface InsuranceHistory {
  id: string;
  carId: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

type InsuranceRow = {
  id: string;
  car_id: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
};

function rowToInsurance(row: InsuranceRow): InsuranceHistory {
  return {
    id: row.id,
    carId: row.car_id,
    startDate: row.start_date,
    endDate: row.end_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const insuranceHistoriesService = {
  async listByCar(carId: string): Promise<InsuranceHistory[]> {
    const { data, error } = await supabase
      .from('insurance_histories')
      .select('id, car_id, start_date, end_date, created_at, updated_at')
      .eq('car_id', carId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[insuranceHistories.listByCar] error:', error.message, '| code:', error.code);
      throw error;
    }
    return (data ?? []).map((r) => rowToInsurance(r as InsuranceRow));
  },

  async create(record: Omit<InsuranceHistory, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const { error } = await supabase.from('insurance_histories').insert({
      car_id: record.carId,
      start_date: record.startDate,
      end_date: record.endDate
    });
    if (error) {
      console.error('[insuranceHistories.create] error:', error.message, '| code:', error.code);
      throw error;
    }
  },

  async update(id: string, record: Partial<Omit<InsuranceHistory, 'id' | 'carId' | 'createdAt'>>): Promise<void> {
    const payload: Record<string, unknown> = {};
    if (record.startDate !== undefined) payload.start_date = record.startDate;
    if (record.endDate !== undefined) payload.end_date = record.endDate;

    if (Object.keys(payload).length === 0) return;
    const { error } = await supabase.from('insurance_histories').update(payload).eq('id', id);
    if (error) {
      console.error('[insuranceHistories.update] error:', error.message, '| code:', error.code);
      throw error;
    }
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('insurance_histories').delete().eq('id', id);
    if (error) {
      console.error('[insuranceHistories.remove] error:', error.message, '| code:', error.code);
      throw error;
    }
  },
};
