// Insurance and Technical Inspection route handlers

import { Context } from "npm:hono";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

export interface HistoryInput {
  startDate?: string;
  endDate?: string;
  fromDate?: string;
  toDate?: string;
}

export interface ExpiryStatus {
  daysUntilExpiry: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
}

const HISTORY_SELECT = "id, car_id, start_date, end_date, created_at, updated_at";

export const verifyCarOwnership = async (supabase: SupabaseClient, carId: string, userId: string) => {
  const { data, error } = await supabase
    .from("cars")
    .select("id")
    .eq("id", carId)
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return data;
};

export const calculateExpiry = (endDate: string | null): ExpiryStatus | null => {
  if (!endDate) return null;
  const expiry = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(expiry.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return { daysUntilExpiry, isExpired: daysUntilExpiry < 0, isExpiringSoon: daysUntilExpiry >= 0 && daysUntilExpiry <= 30 };
};

export const errorResponse = (c: Context, status: number, message: string) => c.json({ success: false, error: message }, status);
export const successResponse = (c: Context, data: unknown, status = 200) => c.json({ success: true, ...data }, status);

const parseHistoryInput = (body: HistoryInput) => {
  const startDate = body.startDate ?? body.fromDate;
  const endDate = body.endDate ?? body.toDate;
  if (!startDate || !endDate) return { error: "startDate and endDate are required" };
  if (Number.isNaN(new Date(`${startDate}T00:00:00`).getTime()) || Number.isNaN(new Date(`${endDate}T00:00:00`).getTime())) {
    return { error: "Invalid date format" };
  }
  return { payload: { start_date: startDate, end_date: endDate } };
};

const withExpiry = (record: { end_date: string | null }) => ({ ...record, ...(calculateExpiry(record.end_date) ?? {}) });

const getHistory = async (c: Context, supabase: SupabaseClient, userId: string, table: "insurance_histories" | "inspection_histories") => {
  const carId = c.req.param("carId");
  const car = await verifyCarOwnership(supabase, carId, userId);
  if (!car) return errorResponse(c, 404, "Car not found");

  const { data, error } = await supabase
    .from(table)
    .select(HISTORY_SELECT)
    .eq("car_id", carId)
    .order("end_date", { ascending: false, nullsFirst: false });

  if (error) {
    console.error(error);
    return errorResponse(c, 500, `Failed to fetch ${table === "insurance_histories" ? "insurance" : "inspection"} history`);
  }

  return successResponse(c, { records: (data ?? []).map(withExpiry) });
};

const createHistory = async (c: Context, supabase: SupabaseClient, userId: string, table: "insurance_histories" | "inspection_histories", responseKey: "insurance" | "inspection") => {
  const carId = c.req.param("carId");
  const car = await verifyCarOwnership(supabase, carId, userId);
  if (!car) return errorResponse(c, 404, "Car not found");

  const parsed = parseHistoryInput(await c.req.json());
  if (parsed.error) return errorResponse(c, 400, parsed.error);

  const { data, error } = await supabase
    .from(table)
    .insert({ car_id: carId, ...parsed.payload })
    .select(HISTORY_SELECT)
    .single();

  if (error) {
    console.error(error);
    return errorResponse(c, 500, `Failed to create ${responseKey} history`);
  }

  return successResponse(c, { [responseKey]: withExpiry(data) }, 201);
};

const updateHistory = async (c: Context, supabase: SupabaseClient, userId: string, table: "insurance_histories" | "inspection_histories", idParam: string, responseKey: "insurance" | "inspection") => {
  const carId = c.req.param("carId");
  const historyId = c.req.param(idParam);
  const car = await verifyCarOwnership(supabase, carId, userId);
  if (!car) return errorResponse(c, 404, "Car not found");

  const parsed = parseHistoryInput(await c.req.json());
  if (parsed.error) return errorResponse(c, 400, parsed.error);

  const { data, error } = await supabase
    .from(table)
    .update(parsed.payload)
    .eq("id", historyId)
    .eq("car_id", carId)
    .select(HISTORY_SELECT)
    .maybeSingle();

  if (error) {
    console.error(error);
    return errorResponse(c, 500, `Failed to update ${responseKey} history`);
  }
  if (!data) return errorResponse(c, 404, `${responseKey} history not found`);

  return successResponse(c, { [responseKey]: withExpiry(data) });
};

const deleteHistory = async (c: Context, supabase: SupabaseClient, userId: string, table: "insurance_histories" | "inspection_histories", idParam: string, label: string) => {
  const carId = c.req.param("carId");
  const historyId = c.req.param(idParam);
  const car = await verifyCarOwnership(supabase, carId, userId);
  if (!car) return errorResponse(c, 404, "Car not found");

  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq("id", historyId)
    .eq("car_id", carId)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(error);
    return errorResponse(c, 500, `Failed to delete ${label} history`);
  }
  if (!data) return errorResponse(c, 404, `${label} history not found`);

  return successResponse(c, { message: `${label} history deleted successfully` });
};

export const getInsuranceHistory = (c: Context, supabase: SupabaseClient, userId: string) => getHistory(c, supabase, userId, "insurance_histories");
export const createInsuranceHistory = (c: Context, supabase: SupabaseClient, userId: string) => createHistory(c, supabase, userId, "insurance_histories", "insurance");
export const updateInsuranceHistory = (c: Context, supabase: SupabaseClient, userId: string) => updateHistory(c, supabase, userId, "insurance_histories", "insuranceId", "insurance");
export const deleteInsuranceHistory = (c: Context, supabase: SupabaseClient, userId: string) => deleteHistory(c, supabase, userId, "insurance_histories", "insuranceId", "Insurance");

export const getInspectionHistory = (c: Context, supabase: SupabaseClient, userId: string) => getHistory(c, supabase, userId, "inspection_histories");
export const createInspectionHistory = (c: Context, supabase: SupabaseClient, userId: string) => createHistory(c, supabase, userId, "inspection_histories", "inspection");
export const updateInspectionHistory = (c: Context, supabase: SupabaseClient, userId: string) => updateHistory(c, supabase, userId, "inspection_histories", "inspectionId", "inspection");
export const deleteInspectionHistory = (c: Context, supabase: SupabaseClient, userId: string) => deleteHistory(c, supabase, userId, "inspection_histories", "inspectionId", "Inspection");
