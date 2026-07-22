import { supabase } from '../supabase';

// Source-of-truth service_items columns: service_id, item_id.
export interface ServiceItem {
  serviceId: string;
  itemId: string;
  itemName?: string;
  parentId?: string | null;
}

type ServiceItemRow = {
  service_id: string;
  item_id: string;
  items?: { name: string; parent_id: string | null } | null;
};

function rowToServiceItem(row: ServiceItemRow): ServiceItem {
  return {
    serviceId: row.service_id,
    itemId: row.item_id,
    itemName: row.items?.name ?? undefined,
    parentId: row.items?.parent_id ?? null,
  };
}

export const serviceItemsService = {
  async listByService(serviceId: string): Promise<ServiceItem[]> {
    const { data, error } = await supabase
      .from('service_items')
      .select('service_id, item_id, items(name, parent_id)')
      .eq('service_id', serviceId);

    if (error) {
      console.error('[serviceItems.listByService] error:', error.message, '| code:', error.code);
      throw error;
    }
    return (data ?? []).map((r) => rowToServiceItem(r as ServiceItemRow));
  },

  async listByServices(serviceIds: string[]): Promise<ServiceItem[]> {
    if (serviceIds.length === 0) return [];
    const { data, error } = await supabase
      .from('service_items')
      .select('service_id, item_id, items(name, parent_id)')
      .in('service_id', serviceIds);

    if (error) {
      console.error('[serviceItems.listByServices] error:', error.message, '| code:', error.code);
      throw error;
    }
    return (data ?? []).map((r) => rowToServiceItem(r as ServiceItemRow));
  },

  async replaceForService(serviceId: string, itemIds: string[]): Promise<void> {
    const { error: delErr } = await supabase
      .from('service_items')
      .delete()
      .eq('service_id', serviceId);

    if (delErr) {
      console.error('[serviceItems.replaceForService] delete error:', delErr.message);
      throw delErr;
    }

    const uniqueItemIds = Array.from(new Set(itemIds.filter(Boolean)));
    if (uniqueItemIds.length === 0) return;

    const rows = uniqueItemIds.map((itemId) => ({ service_id: serviceId, item_id: itemId }));
    const { error: insErr } = await supabase.from('service_items').insert(rows);
    if (insErr) {
      console.error('[serviceItems.replaceForService] insert error:', insErr.message);
      throw insErr;
    }
  },
};
