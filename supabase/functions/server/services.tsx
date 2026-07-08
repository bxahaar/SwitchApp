// Service-related route handlers
// Import this file in index.tsx to add service endpoints

import { Context } from "npm:hono";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

// Get service history for a car
export const getServices = async (c: Context, supabase: SupabaseClient, userId: string) => {
  try {
    const carId = c.req.param('carId');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');
    const category = c.req.query('category');
    const fromDate = c.req.query('fromDate');
    const toDate = c.req.query('toDate');
    
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
    
    // Build query
    let query = supabase
      .from('services')
      .select(`
        *,
        category:service_categories(id, key, name_fa, name_en, icon, color)
      `, { count: 'exact' })
      .eq('car_id', carId)
      .order('service_date', { ascending: false });
    
    if (category) {
      const { data: categoryData } = await supabase
        .from('service_categories')
        .select('id')
        .eq('key', category)
        .single();
      if (categoryData) {
        query = query.eq('category_id', categoryData.id);
      }
    }
    
    if (fromDate) {
      query = query.gte('service_date', fromDate);
    }
    
    if (toDate) {
      query = query.lte('service_date', toDate);
    }
    
    query = query.range(offset, offset + limit - 1);
    
    const { data: services, error, count } = await query;
    
    if (error) {
      console.error('Error fetching services:', error);
      return c.json({ success: false, error: 'Failed to fetch services' }, 500);
    }
    
    // Fetch service items for each service
    const servicesWithItems = await Promise.all((services || []).map(async (service) => {
      const { data: items } = await supabase
        .from('service_items')
        .select(`
          *,
          checklist_item:service_checklist_items(id, name_fa, name_en)
        `)
        .eq('service_id', service.id);
      
      return {
        ...service,
        items: (items || []).map(item => ({
          id: item.id,
          checklistItemId: item.checklist_item_id,
          name: item.custom_item_name || item.checklist_item?.name_fa || item.checklist_item?.name_en,
          isChecked: item.is_checked,
          notes: item.notes,
        })),
      };
    }));
    
    return c.json({
      services: servicesWithItems,
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Error in get services endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
};

// Get single service
export const getService = async (c: Context, supabase: SupabaseClient, userId: string) => {
  try {
    const carId = c.req.param('carId');
    const serviceId = c.req.param('serviceId');
    
    const { data: service, error } = await supabase
      .from('services')
      .select(`
        *,
        category:service_categories(id, key, name_fa, name_en, icon, color)
      `)
      .eq('id', serviceId)
      .eq('car_id', carId)
      .eq('user_id', userId)
      .single();
    
    if (error || !service) {
      return c.json({ success: false, error: 'Service not found' }, 404);
    }
    
    // Fetch service items
    const { data: items } = await supabase
      .from('service_items')
      .select(`
        *,
        checklist_item:service_checklist_items(id, name_fa, name_en)
      `)
      .eq('service_id', service.id);
    
    return c.json({
      ...service,
      items: (items || []).map(item => ({
        id: item.id,
        checklistItemId: item.checklist_item_id,
        name: item.custom_item_name || item.checklist_item?.name_fa || item.checklist_item?.name_en,
        isChecked: item.is_checked,
        notes: item.notes,
      })),
    });
  } catch (error) {
    console.error('Error in get service endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
};

// Create new service
export const createService = async (c: Context, supabase: SupabaseClient, userId: string) => {
  try {
    const carId = c.req.param('carId');
    const serviceData = await c.req.json();
    
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
    
    // Validate required fields
    if (!serviceData.serviceDate) {
      return c.json({ success: false, error: 'Service date is required' }, 400);
    }
    
    // Create service record
    const { data: service, error: serviceError } = await supabase
      .from('services')
      .insert({
        car_id: carId,
        user_id: userId,
        category_id: serviceData.categoryId,
        service_date: serviceData.serviceDate,
        mileage: serviceData.mileage,
        cost: serviceData.cost,
        currency: serviceData.currency || 'toman',
        description: serviceData.description,
        notes: serviceData.notes,
        service_provider: serviceData.serviceProvider,
        service_provider_phone: serviceData.serviceProviderPhone,
      })
      .select()
      .single();
    
    if (serviceError) {
      console.error('Error creating service:', serviceError);
      return c.json({ success: false, error: 'Failed to create service' }, 500);
    }
    
    // Create service items
    if (serviceData.items && serviceData.items.length > 0) {
      const itemsToInsert = serviceData.items.map((item: any) => ({
        service_id: service.id,
        checklist_item_id: item.checklistItemId || null,
        custom_item_name: item.customItemName || null,
        is_checked: item.isChecked !== false,
        notes: item.notes || null,
      }));
      
      const { error: itemsError } = await supabase
        .from('service_items')
        .insert(itemsToInsert);
      
      if (itemsError) {
        console.error('Error creating service items:', itemsError);
        // Don't fail the whole operation, just log the error
      }
    }
    
    // Update car mileage if provided
    if (serviceData.mileage) {
      await supabase
        .from('cars')
        .update({
          current_mileage: serviceData.mileage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', carId);
    }
    
    return c.json({ success: true, service });
  } catch (error) {
    console.error('Error in create service endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
};

// Update service
export const updateService = async (c: Context, supabase: SupabaseClient, userId: string) => {
  try {
    const carId = c.req.param('carId');
    const serviceId = c.req.param('serviceId');
    const updates = await c.req.json();
    
    // Update service record
    const { data: service, error } = await supabase
      .from('services')
      .update({
        category_id: updates.categoryId,
        service_date: updates.serviceDate,
        mileage: updates.mileage,
        cost: updates.cost,
        currency: updates.currency,
        description: updates.description,
        notes: updates.notes,
        service_provider: updates.serviceProvider,
        service_provider_phone: updates.serviceProviderPhone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', serviceId)
      .eq('car_id', carId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating service:', error);
      return c.json({ success: false, error: 'Failed to update service' }, 500);
    }
    
    // Update service items if provided
    if (updates.items) {
      // Delete existing items
      await supabase
        .from('service_items')
        .delete()
        .eq('service_id', serviceId);
      
      // Insert new items
      if (updates.items.length > 0) {
        const itemsToInsert = updates.items.map((item: any) => ({
          service_id: serviceId,
          checklist_item_id: item.checklistItemId || null,
          custom_item_name: item.customItemName || null,
          is_checked: item.isChecked !== false,
          notes: item.notes || null,
        }));
        
        await supabase
          .from('service_items')
          .insert(itemsToInsert);
      }
    }
    
    return c.json({ success: true, service });
  } catch (error) {
    console.error('Error in update service endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
};

// Delete service
export const deleteService = async (c: Context, supabase: SupabaseClient, userId: string) => {
  try {
    const carId = c.req.param('carId');
    const serviceId = c.req.param('serviceId');
    
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId)
      .eq('car_id', carId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting service:', error);
      return c.json({ success: false, error: 'Failed to delete service' }, 500);
    }
    
    return c.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error in delete service endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
};

// Get service statistics
export const getServiceStats = async (c: Context, supabase: SupabaseClient, userId: string) => {
  try {
    const carId = c.req.param('carId');
    const year = c.req.query('year') ? parseInt(c.req.query('year')!) : new Date().getFullYear();
    
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
    
    // Get all services for the car
    const { data: services } = await supabase
      .from('services')
      .select(`
        *,
        category:service_categories(key, name_fa, name_en)
      `)
      .eq('car_id', carId)
      .gte('service_date', `${year}-01-01`)
      .lte('service_date', `${year}-12-31`);
    
    const totalServices = services?.length || 0;
    const totalCost = (services || []).reduce((sum, s) => sum + (parseFloat(s.cost as string) || 0), 0);
    const averageCostPerService = totalServices > 0 ? totalCost / totalServices : 0;
    
    // Services by category
    const categoryMap = new Map();
    (services || []).forEach(service => {
      const key = service.category?.key || 'other';
      const name = service.category?.name_fa || 'سایر';
      const cost = parseFloat(service.cost as string) || 0;
      
      if (categoryMap.has(key)) {
        const existing = categoryMap.get(key);
        categoryMap.set(key, {
          ...existing,
          count: existing.count + 1,
          totalCost: existing.totalCost + cost,
        });
      } else {
        categoryMap.set(key, {
          categoryKey: key,
          categoryName: name,
          count: 1,
          totalCost: cost,
        });
      }
    });
    
    const servicesByCategory = Array.from(categoryMap.values());
    
    // Monthly services
    const monthlyMap = new Map();
    (services || []).forEach(service => {
      const month = service.service_date.substring(0, 7); // YYYY-MM
      const cost = parseFloat(service.cost as string) || 0;
      
      if (monthlyMap.has(month)) {
        const existing = monthlyMap.get(month);
        monthlyMap.set(month, {
          month,
          count: existing.count + 1,
          cost: existing.cost + cost,
        });
      } else {
        monthlyMap.set(month, {
          month,
          count: 1,
          cost,
        });
      }
    });
    
    const monthlyServices = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
    
    return c.json({
      totalServices,
      totalCost,
      averageCostPerService,
      servicesByCategory,
      monthlyServices,
    });
  } catch (error) {
    console.error('Error in service stats endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
};
