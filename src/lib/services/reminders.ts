import { supabase } from '../supabase';
import type { Reminder } from './types';

// public.reminders columns: id, car_id, item_id, target_date, target_kilometer, description, created_at, updated_at
type ReminderRow = {
  id: string;
  car_id: string;
  item_id: string;
  target_date: string | null;
  target_kilometer: number | null;
  description: string | null;
};

function rowToReminder(row: ReminderRow): Reminder {
  const hasMileageTarget = row.target_kilometer !== null && row.target_kilometer !== undefined;
  return {
    id: row.id,
    carId: row.car_id,
    type: row.item_id,
    reminderType: hasMileageTarget ? 'mileage' : 'date',
    reminderValue: hasMileageTarget ? Number(row.target_kilometer) : (row.target_date ?? ''),
    reminderNote: row.description ?? '',
  };
}

function reminderToPayload(reminder: Omit<Reminder, 'id'>) {
  const isMileage = reminder.reminderType === 'mileage';
  return {
    car_id: reminder.carId,
    item_id: reminder.type,
    target_date: isMileage ? null : String(reminder.reminderValue || ''),
    target_kilometer: isMileage ? Number(reminder.reminderValue || 0) : null,
    description: reminder.reminderNote || null,
  };
}

export const remindersService = {
  async listByCars(carIds: string[]): Promise<Reminder[]> {
    if (carIds.length === 0) return [];
    const { data, error } = await supabase
      .from('reminders')
      .select('id, car_id, item_id, target_date, target_kilometer, description')
      .in('car_id', carIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[reminders.listByCars] error:', error.message, '| code:', error.code);
      throw error;
    }
    return (data ?? []).map((r) => rowToReminder(r as ReminderRow));
  },

  async create(reminder: Omit<Reminder, 'id'>): Promise<void> {
    const { error } = await supabase.from('reminders').insert(reminderToPayload(reminder));
    if (error) {
      console.error('[reminders.create] error:', error.message, '| code:', error.code, '| details:', error.details);
      throw error;
    }
  },

  async update(id: string, reminder: Omit<Reminder, 'id'>): Promise<void> {
    const { error } = await supabase.from('reminders').update(reminderToPayload(reminder)).eq('id', id);
    if (error) {
      console.error('[reminders.update] error:', error.message, '| code:', error.code, '| details:', error.details);
      throw error;
    }
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('reminders').delete().eq('id', id);
    if (error) {
      console.error('[reminders.remove] error:', error.message, '| code:', error.code);
      throw error;
    }
  },
};
