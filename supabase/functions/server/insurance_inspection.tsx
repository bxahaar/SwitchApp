// Insurance and Technical Inspection route handlers
// Import this file in index.tsx to add insurance/inspection endpoints

import { Context } from "npm:hono";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

// ============================================================================
// INSURANCE ENDPOINTS
// ============================================================================

// Get insurance records for a car
export const getInsuranceRecords = async (c: Context, supabase: SupabaseClient, userId: string) => {
  try {
    const carId = c.req.param('carId');
    const current = c.req.query('current') === 'true';
    
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
    
    let query = supabase
      .from('insurance_records')
      .select('*')
      .eq('car_id', carId)
      .order('start_date', { ascending: false });
    
    if (current) {
      query = query.eq('is_current', true);
    }
    
    const { data: records, error } = await query;
    
    if (error) {
      console.error('Error fetching insurance records:', error);
      return c.json({ success: false, error: 'Failed to fetch insurance records' }, 500);
    }
    
    // Add days until expiry calculation
    const recordsWithCalculations = (records || []).map(record => {
      const daysUntilExpiry = Math.ceil((new Date(record.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return {
        ...record,
        daysUntilExpiry,
        isExpiringSoon: daysUntilExpiry <= 30 && daysUntilExpiry > 0,
      };
    });
    
    return c.json({ records: recordsWithCalculations });
  } catch (error) {
    console.error('Error in get insurance records endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
};

// Create insurance record
export const createInsuranceRecord = async (c: Context, supabase: SupabaseClient, userId: string) => {
  try {
    const carId = c.req.param('carId');
    const insuranceData = await c.req.json();
    
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
    if (!insuranceData.startDate || !insuranceData.endDate) {
      return c.json({ success: false, error: 'Start date and end date are required' }, 400);
    }
    
    // If this is current, mark others as not current
    if (insuranceData.isCurrent) {
      await supabase
        .from('insurance_records')
        .update({ is_current: false, updated_at: new Date().toISOString() })
        .eq('car_id', carId);
    }
    
    const { data: insurance, error } = await supabase
      .from('insurance_records')
      .insert({
        car_id: carId,
        user_id: userId,
        insurance_type: insuranceData.insuranceType,
        insurance_company: insuranceData.insuranceCompany,
        policy_number: insuranceData.policyNumber,
        start_date: insuranceData.startDate,
        end_date: insuranceData.endDate,
        premium_amount: insuranceData.premiumAmount,
        currency: insuranceData.currency || 'toman',
        document_url: insuranceData.documentUrl,
        is_current: insuranceData.isCurrent !== false,
        notes: insuranceData.notes,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating insurance record:', error);
      return c.json({ success: false, error: 'Failed to create insurance record' }, 500);
    }
    
    return c.json({ success: true, insurance });
  } catch (error) {
    console.error('Error in create insurance record endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
};

// Update insurance record
export const updateInsuranceRecord = async (c: Context, supabase: SupabaseClient, userId: string) => {
  try {
    const carId = c.req.param('carId');
    const insuranceId = c.req.param('insuranceId');
    const updates = await c.req.json();
    
    // If marking as current, unmark others
    if (updates.isCurrent === true) {
      await supabase
        .from('insurance_records')
        .update({ is_current: false, updated_at: new Date().toISOString() })
        .eq('car_id', carId)
        .neq('id', insuranceId);
    }
    
    const { data: insurance, error } = await supabase
      .from('insurance_records')
      .update({
        insurance_type: updates.insuranceType,
        insurance_company: updates.insuranceCompany,
        policy_number: updates.policyNumber,
        start_date: updates.startDate,
        end_date: updates.endDate,
        premium_amount: updates.premiumAmount,
        currency: updates.currency,
        document_url: updates.documentUrl,
        is_current: updates.isCurrent,
        notes: updates.notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', insuranceId)
      .eq('car_id', carId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating insurance record:', error);
      return c.json({ success: false, error: 'Failed to update insurance record' }, 500);
    }
    
    return c.json({ success: true, insurance });
  } catch (error) {
    console.error('Error in update insurance record endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
};

// Delete insurance record
export const deleteInsuranceRecord = async (c: Context, supabase: SupabaseClient, userId: string) => {
  try {
    const carId = c.req.param('carId');
    const insuranceId = c.req.param('insuranceId');
    
    const { error } = await supabase
      .from('insurance_records')
      .delete()
      .eq('id', insuranceId)
      .eq('car_id', carId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting insurance record:', error);
      return c.json({ success: false, error: 'Failed to delete insurance record' }, 500);
    }
    
    return c.json({ success: true, message: 'Insurance record deleted successfully' });
  } catch (error) {
    console.error('Error in delete insurance record endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
};

// ============================================================================
// TECHNICAL INSPECTION ENDPOINTS
// ============================================================================

// Get technical inspection records for a car
export const getInspectionRecords = async (c: Context, supabase: SupabaseClient, userId: string) => {
  try {
    const carId = c.req.param('carId');
    const current = c.req.query('current') === 'true';
    
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
    
    let query = supabase
      .from('technical_inspection_records')
      .select('*')
      .eq('car_id', carId)
      .order('inspection_date', { ascending: false });
    
    if (current) {
      query = query.eq('is_current', true);
    }
    
    const { data: records, error } = await query;
    
    if (error) {
      console.error('Error fetching inspection records:', error);
      return c.json({ success: false, error: 'Failed to fetch inspection records' }, 500);
    }
    
    // Add days until expiry calculation
    const recordsWithCalculations = (records || []).map(record => {
      const daysUntilExpiry = Math.ceil((new Date(record.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return {
        ...record,
        daysUntilExpiry,
        isExpiringSoon: daysUntilExpiry <= 30 && daysUntilExpiry > 0,
      };
    });
    
    return c.json({ records: recordsWithCalculations });
  } catch (error) {
    console.error('Error in get inspection records endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
};

// Create technical inspection record
export const createInspectionRecord = async (c: Context, supabase: SupabaseClient, userId: string) => {
  try {
    const carId = c.req.param('carId');
    const inspectionData = await c.req.json();
    
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
    if (!inspectionData.inspectionDate || !inspectionData.expiryDate) {
      return c.json({ success: false, error: 'Inspection date and expiry date are required' }, 400);
    }
    
    // If this is current, mark others as not current
    if (inspectionData.isCurrent) {
      await supabase
        .from('technical_inspection_records')
        .update({ is_current: false, updated_at: new Date().toISOString() })
        .eq('car_id', carId);
    }
    
    const { data: inspection, error } = await supabase
      .from('technical_inspection_records')
      .insert({
        car_id: carId,
        user_id: userId,
        inspection_center: inspectionData.inspectionCenter,
        certificate_number: inspectionData.certificateNumber,
        inspection_date: inspectionData.inspectionDate,
        expiry_date: inspectionData.expiryDate,
        passed: inspectionData.passed !== false,
        notes: inspectionData.notes,
        document_url: inspectionData.documentUrl,
        is_current: inspectionData.isCurrent !== false,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating inspection record:', error);
      return c.json({ success: false, error: 'Failed to create inspection record' }, 500);
    }
    
    return c.json({ success: true, inspection });
  } catch (error) {
    console.error('Error in create inspection record endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
};

// Update technical inspection record
export const updateInspectionRecord = async (c: Context, supabase: SupabaseClient, userId: string) => {
  try {
    const carId = c.req.param('carId');
    const inspectionId = c.req.param('inspectionId');
    const updates = await c.req.json();
    
    // If marking as current, unmark others
    if (updates.isCurrent === true) {
      await supabase
        .from('technical_inspection_records')
        .update({ is_current: false, updated_at: new Date().toISOString() })
        .eq('car_id', carId)
        .neq('id', inspectionId);
    }
    
    const { data: inspection, error } = await supabase
      .from('technical_inspection_records')
      .update({
        inspection_center: updates.inspectionCenter,
        certificate_number: updates.certificateNumber,
        inspection_date: updates.inspectionDate,
        expiry_date: updates.expiryDate,
        passed: updates.passed,
        notes: updates.notes,
        document_url: updates.documentUrl,
        is_current: updates.isCurrent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inspectionId)
      .eq('car_id', carId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating inspection record:', error);
      return c.json({ success: false, error: 'Failed to update inspection record' }, 500);
    }
    
    return c.json({ success: true, inspection });
  } catch (error) {
    console.error('Error in update inspection record endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
};

// Delete technical inspection record
export const deleteInspectionRecord = async (c: Context, supabase: SupabaseClient, userId: string) => {
  try {
    const carId = c.req.param('carId');
    const inspectionId = c.req.param('inspectionId');
    
    const { error } = await supabase
      .from('technical_inspection_records')
      .delete()
      .eq('id', inspectionId)
      .eq('car_id', carId)
      .eq('user_id', userId);
    
    if (error) {
      console.error('Error deleting inspection record:', error);
      return c.json({ success: false, error: 'Failed to delete inspection record' }, 500);
    }
    
    return c.json({ success: true, message: 'Inspection record deleted successfully' });
  } catch (error) {
    console.error('Error in delete inspection record endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
};
