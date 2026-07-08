// Reminder-related route handlers
// Import this file in index.tsx to add reminder endpoints

import { Context } from "npm:hono";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

// Get reminders for a car
export const getReminders = async (c: Context, supabase: SupabaseClient, userId: string) => {
  try {
    const carId = c.req.param('carId');
    const status = c.req.query('status');
    
    // Verify car ownership
    const { data: car } = await supabase
      .from('cars')
      .select('id, current_mileage')
      .eq('id', carId)
      .eq('user_id', userId)
      .single();
    
    if (!car) {
      return c.json({ success: false, error: 'Car not found' }, 404);
    }
    
    let query = supabase
      .from('reminders')
      .select(`
        *,
        category:service_categories(id, key, name_fa, name_en, icon, color)
      `)
      .eq('car_id', carId);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    query = query.order('due_date', { ascending: true, nullsFirst: false });
    
    const { data: reminders, error } = await query;
    
    if (error) {
      console.error('Error fetching reminders:', error);
      return c.json({ success: false, error: 'Failed to fetch reminders' }, 500);
    }
    
    // Calculate days/km until due
    const remindersWithCalculations = (reminders || []).map(reminder => {
      const now = Date.now();
      let daysUntilDue = null;
      let kmUntilDue = null;
      let isOverdue = false;
      
      if (reminder.due_date) {
        const dueTime = new Date(reminder.due_date).getTime();
        daysUntilDue = Math.ceil((dueTime - now) / (1000 * 60 * 60 * 24));
        isOverdue = daysUntilDue < 0;
      }
      
      if (reminder.due_mileage && car.current_mileage) {
        kmUntilDue = reminder.due_mileage - car.current_mileage;
        isOverdue = isOverdue || kmUntilDue < 0;
      }
      
      return {
        ...reminder,
        daysUntilDue,
        kmUntilDue,
        isOverdue,
      };
    });
    
    return c.json({ reminders: remindersWithCalculations });
  } catch (error) {
    console.error('Error in get reminders endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
};

// Get all upcoming reminders for user (across all cars)
export const getAllUpcomingReminders = async (c: Context, supabase: SupabaseClient, userId: string) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20');
    
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select(`
        *,
        car:cars!inner(id, brand, model, license_plate, current_mileage),
        category:service_categories(id, key, name_fa, name_en, icon, color)
      `)
      .eq('user_id', userId)
      .eq('status', 'upcoming')
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching all reminders:', error);
      return c.json({ success: false, error: 'Failed to fetch reminders' }, 500);
    }
    
    // Calculate days/km until due
    const remindersWithCalculations = (reminders || []).map(reminder => {
      const now = Date.now();
      let daysUntilDue = null;
      let kmUntilDue = null;
      let isOverdue = false;
      
      if (reminder.due_date) {
        const dueTime = new Date(reminder.due_date).getTime();
        daysUntilDue = Math.ceil((dueTime - now) / (1000 * 60 * 60 * 24));
        isOverdue = daysUntilDue < 0;
      }
      
      if (reminder.due_mileage && reminder.car.current_mileage) {
        kmUntilDue = reminder.due_mileage - reminder.car.current_mileage;
        isOverdue = isOverdue || kmUntilDue < 0;
      }
      
      return {
        ...reminder,
        daysUntilDue,
        kmUntilDue,
        isOverdue,
      };
    });
    
    return c.json({ reminders: remindersWithCalculations });
  } catch (error) {
    console.error('Error in get all reminders endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
};

// Create new reminder
export const createReminder = async (c: Context, supabase: SupabaseClient, userId: string) => {
  try {
    const carId = c.req.param('carId');
    const reminderData = await c.req.json();
    
    // Verify car ownership
    const { data: car } = await supabase
      .from('cars')
      .select('id')
      .eq('id', carId)
      .eq('user_id', userId)
      .single();
    
    if (!car) {
      return c.json({ success: false, error: 'Car not found' }, 404);
    }
    
    // Validate: at least one due condition must be set
    if (!reminderData.dueDate && !reminderData.dueMileage) {
      return c.json({ success: false, error: 'Either due date or due mileage is required' }, 400);
    }
    
    if (!reminderData.title) {
      return c.json({ success: false, error: 'Title is required' }, 400);
    }
    
    const { data: reminder, error } = await supabase
      .from('reminders')
      .insert({
        car_id: carId,
        user_id: userId,
        category_id: reminderData.categoryId,
        title: reminderData.title,
        description: reminderData.description,
        due_date: reminderData.dueDate || null,
        due_mileage: reminderData.dueMileage || null,
        notify_days_before: reminderData.notifyDaysBefore || 7,
        notify_km_before: reminderData.notifyKmBefore || 500,
        status: 'upcoming',
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating reminder:', error);
      return c.json({ success: false, error: 'Failed to create reminder' }, 500);
    }
    
    return c.json({ success: true, reminder });
  } catch (error) {
    console.error('Error in create reminder endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
};

// Update reminder
export const updateReminder = async (c: Context, supabase: SupabaseClient, userId: string) => {
  try {
    const carId = c.req.param('carId');
    const reminderId = c.req.param('reminderId');
    const updates = await c.req.json();
    
    const { data: reminder, error } = await supabase
      .from('reminders')
      .update({
        category_id: updates.categoryId,
        title: updates.title,
        description: updates.description,
        due_date: updates.dueDate,
        due_mileage: updates.dueMileage,
        notify_days_before: updates.notifyDaysBefore,
        notify_km_before: updates.notifyKmBefore,
        status: updates.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reminderId)
      .eq('car_id', carId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating reminder:', error);
      return c.json({ success: false, error: 'Failed to update reminder' }, 500);
    }
    
    return c.json({ success: true, reminder });
  } catch (error) {
    console.error('Error in update reminder endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
};

// Mark reminder as completed
export const completeReminder = async (c: Context, supabase: SupabaseClient, userId: string) => {
  try {
    const carId = c.req.param('carId');
    const reminderId = c.req.param('reminderId');
    const { serviceId } = await c.req.json();
    
    const { data: reminder, error } = await supabase
      .from('reminders')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_service_id: serviceId || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reminderId)
      .eq('car_id', carId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error completing reminder:', error);
      return c.json({ success: false, error: 'Failed to complete reminder' }, 500);
    }
    
    return c.json({ success: true, reminder });
  } catch (error) {
    console.error('Error in complete reminder endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
};

// Dismiss reminder
export const dismissReminder = async (c: Context, supabase: SupabaseClient, userId: string) => {
  try {
    const carId = c.req.param('carId');
    const reminderId = c.req.param('reminderId');
    
    const { data: reminder, error } = await supabase
      .from('reminders')
      .update({
        status: 'dismissed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', reminderId)
      .eq('car_id', carId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error dismissing reminder:', error);
      return c.json({ success: false, error: 'Failed to dismiss reminder' }, 500);
    }
    
    return c.json({ success: true, reminder });
  } catch (error) {
    console.error('Error in dismiss reminder endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
};

// Delete reminder
export const deleteReminder = async (c: Context, supabase: SupabaseClient, userId: string) => {
  try {
    const carId = c.req.param('carId');
    const reminderId = c.req.param('reminderId');
    
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', reminderId)
      .eq('car_id', carId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting reminder:', error);
      return c.json({ success: false, error: 'Failed to delete reminder' }, 500);
    }
    
    return c.json({ success: true, message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error in delete reminder endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
};
