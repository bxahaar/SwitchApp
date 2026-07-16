import { supabase } from '../supabase';
import { typeToCategory, categoryToType } from './categories';
import type { Reminder } from './types';

// public.reminders columns: id, car_id, category_id, description, created_at
// The reminder schedule (type/value/note) is encoded as JSON in `description`.
type ReminderRow = {
  id: string;
  car_id: string;
  category_id: string;
  description: string | null;
};

interface ReminderMeta {
  reminderType?: 'date' | 'mileage';
  reminderValue?: string | number;
  reminderNote?: string;
}

function parseMeta(description: string | null): ReminderMeta {
  if (!description) return {};
  try {
    return (JSON.parse(description) as ReminderMeta) ?? {};
  } catch {
    return {};
  }
}

function rowToReminder(row: ReminderRow): Reminder {
  const meta = parseMeta(row.description);
  return {
    id: row.id,
    carId: row.car_id,
    type: categoryToType(row.category_id),
    reminderType: meta.reminderType ?? 'date',
    reminderValue: meta.reminderValue ?? '',
    reminderNote: meta.reminderNote,
  };
}

export const remindersService = {
  async listByCars(carIds: string[]): Promise<Reminder[]> {
    if (carIds.length === 0) return [];
    const { data, error } = await supabase
      .from('reminders')
      .select('id, car_id, category_id, description')
      .in('car_id', carIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[reminders.listByCars] error:', error.message, '| code:', error.code);
      throw error;
    }
    return (data ?? []).map((r) => rowToReminder(r as ReminderRow));
  },

  async create(reminder: Omit<Reminder, 'id'>): Promise<void> {
    const meta: ReminderMeta = {
      reminderType: reminder.reminderType,
      reminderValue: reminder.reminderValue,
      reminderNote: reminder.reminderNote,
    };
    const { error } = await supabase.from('reminders').insert({
      car_id: reminder.carId,
      category_id: typeToCategory(reminder.type),
      description: JSON.stringify(meta),
    });
    if (error) {
      console.error('[reminders.create] error:', error.message, '| code:', error.code, '| details:', error.details);
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
