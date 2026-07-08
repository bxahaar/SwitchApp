// Notification route handlers
// Import this file in index.tsx to add notification endpoints

import { Context } from "npm:hono";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

// Get user's notifications
export const getNotifications = async (c: Context, supabase: SupabaseClient, userId: string) => {
  try {
    const unread = c.req.query('unread') === 'true';
    const type = c.req.query('type');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');
    
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('sent_at', { ascending: false });
    
    if (unread) {
      query = query.eq('is_read', false);
    }
    
    if (type) {
      query = query.eq('type', type);
    }
    
    query = query.range(offset, offset + limit - 1);
    
    const { data: notifications, error, count } = await query;
    
    if (error) {
      console.error('Error fetching notifications:', error);
      return c.json({ success: false, error: 'Failed to fetch notifications' }, 500);
    }
    
    // Get unread count
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    
    return c.json({
      notifications: notifications || [],
      pagination: {
        total: count || 0,
        limit,
        offset,
        unreadCount: unreadCount || 0,
      },
    });
  } catch (error) {
    console.error('Error in get notifications endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
};

// Mark notification as read
export const markNotificationAsRead = async (c: Context, supabase: SupabaseClient, userId: string) => {
  try {
    const notificationId = c.req.param('notificationId');
    
    const { data: notification, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error marking notification as read:', error);
      return c.json({ success: false, error: 'Failed to mark notification as read' }, 500);
    }
    
    return c.json({ success: true, notification });
  } catch (error) {
    console.error('Error in mark notification as read endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (c: Context, supabase: SupabaseClient, userId: string) => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('is_read', false)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error marking all notifications as read:', error);
      return c.json({ success: false, error: 'Failed to mark notifications as read' }, 500);
    }
    
    return c.json({ success: true, count: count || 0 });
  } catch (error) {
    console.error('Error in mark all notifications as read endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
};

// Delete notification
export const deleteNotification = async (c: Context, supabase: SupabaseClient, userId: string) => {
  try {
    const notificationId = c.req.param('notificationId');
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting notification:', error);
      return c.json({ success: false, error: 'Failed to delete notification' }, 500);
    }
    
    return c.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error in delete notification endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
};

// Create notification (internal helper, can be called by server-side logic)
export const createNotification = async (
  supabase: SupabaseClient,
  userId: string,
  type: string,
  title: string,
  body: string,
  referenceType?: string,
  referenceId?: string
) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type,
        title,
        body,
        reference_type: referenceType || null,
        reference_id: referenceId || null,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createNotification helper:', error);
    return null;
  }
};
