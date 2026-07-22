import { supabase } from '../supabase';

// public.items columns: id, name, parent_id, user_id, created_at, updated_at
export interface Item {
  id: string;
  name: string;
  parentId: string | null;
  userId: string | null;
}

type ItemRow = {
  id: string;
  name: string;
  parent_id: string | null;
  user_id: string | null;
};

function rowToItem(row: ItemRow): Item {
  return {
    id: row.id,
    name: row.name,
    parentId: row.parent_id,
    userId: row.user_id,
  };
}

const itemSelect = 'id, name, parent_id, user_id';

export const itemsService = {
  /** Load all system items (user_id IS NULL) + the current user's custom items via RLS. */
  async list(): Promise<Item[]> {
    const { data, error } = await supabase
      .from('items')
      .select(itemSelect)
      .order('name', { ascending: true });

    if (error) {
      console.error('[items.list] error:', error.message, '| code:', error.code);
      throw error;
    }
    return (data ?? []).map((r) => rowToItem(r as ItemRow));
  },

  /** Load parent categories only (parent_id IS NULL). */
  async listRoots(): Promise<Item[]> {
    const { data, error } = await supabase
      .from('items')
      .select(itemSelect)
      .is('parent_id', null)
      .order('name', { ascending: true });

    if (error) {
      console.error('[items.listRoots] error:', error.message, '| code:', error.code);
      throw error;
    }
    return (data ?? []).map((r) => rowToItem(r as ItemRow));
  },

  /** Load child service items for a given parent category. */
  async listChildren(parentId: string): Promise<Item[]> {
    const { data, error } = await supabase
      .from('items')
      .select(itemSelect)
      .eq('parent_id', parentId)
      .order('name', { ascending: true });

    if (error) {
      console.error('[items.listChildren] error:', error.message, '| code:', error.code);
      throw error;
    }
    return (data ?? []).map((r) => rowToItem(r as ItemRow));
  },

  /** Create a custom user-owned child item under the selected parent category. */
  async create(item: Pick<Item, 'name' | 'parentId'>): Promise<Item> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated: cannot create item');
    if (!item.parentId) throw new Error('A parent category is required to create an item');

    const { data, error } = await supabase
      .from('items')
      .insert({
        name: item.name,
        parent_id: item.parentId,
        user_id: user.id,
      })
      .select(itemSelect)
      .single();

    if (error) {
      console.error('[items.create] error:', error.message, '| code:', error.code);
      throw error;
    }
    return rowToItem(data as ItemRow);
  },

  /** Update a user-owned custom item. System items are protected by RLS. */
  async update(id: string, changes: Pick<Item, 'name'>): Promise<Item> {
    const { data, error } = await supabase
      .from('items')
      .update({ name: changes.name })
      .eq('id', id)
      .select(itemSelect)
      .single();

    if (error) {
      console.error('[items.update] error:', error.message, '| code:', error.code);
      throw error;
    }
    return rowToItem(data as ItemRow);
  },

  /** Delete a user-owned item (system items are protected by RLS). */
  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('items').delete().eq('id', id);
    if (error) {
      console.error('[items.remove] error:', error.message, '| code:', error.code);
      throw error;
    }
  },
};
