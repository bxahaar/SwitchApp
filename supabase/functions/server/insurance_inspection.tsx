// Insurance and Technical Inspection route handlers
// Import this file in index.tsx to add insurance/inspection endpoints

import { Context } from "npm:hono";
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";



// ============================================================================
// TYPES
// ============================================================================

export interface InsuranceHistoryInput {
  fromDate: string;
  toDate: string;
}

export interface ExpiryStatus {
  daysUntilExpiry: number;
  isExpired: boolean;
  isExpiringSoon: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

export const verifyCarOwnership = async (
  supabase: SupabaseClient,
  carId: string,
  userId: string
) => {
  const { data, error } = await supabase
    .from("cars")
    .select("id")
    .eq("id", carId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
};

export const calculateExpiry = (
  toDate: string
): ExpiryStatus => {
  const today = new Date();

  const expiry = new Date(toDate);

  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - today.getTime()) /
      (1000 * 60 * 60 * 24)
  );

  return {
    daysUntilExpiry,
    isExpired: daysUntilExpiry < 0,
    isExpiringSoon:
      daysUntilExpiry >= 0 &&
      daysUntilExpiry <= 30,
  };
};

export const errorResponse = (
  c: Context,
  status: number,
  message: string
) => {
  return c.json(
    {
      success: false,
      error: message,
    },
    status
  );
};

export const successResponse = (
  c: Context,
  data: unknown,
  status = 200
) => {
  return c.json(
    {
      success: true,
      ...data,
    },
    status
  );
};



//GET INSURANCE HISTORY

export const getInsuranceHistory = async (
  c: Context,
  supabase: SupabaseClient,
  userId: string
) => {
  try {
    const carId = c.req.param("carId");

    const car = await verifyCarOwnership(
      supabase,
      carId,
      userId
    );

    if (!car) {
      return errorResponse(c, 404, "Car not found");
    }

    const { data, error } = await supabase
      .from("insurance_histories")
      .select("*")
      .eq("car_id", carId)
      .order("to_date", { ascending: false });

    if (error) {
      console.error(error);

      return errorResponse(
        c,
        500,
        "Failed to fetch insurance history"
      );
    }

    const records =
      data?.map(record => ({
        ...record,
        ...calculateExpiry(record.to_date),
      })) ?? [];

    return successResponse(c, {
      records,
    });

  } catch (error) {
    console.error(error);

    return errorResponse(
      c,
      500,
      "Internal server error"
    );
  }
};

//CREATE INSURANCE HISTORY

export const createInsuranceHistory = async (
  c: Context,
  supabase: SupabaseClient,
  userId: string
) => {
  try {
    const carId = c.req.param("carId");

    const car = await verifyCarOwnership(
      supabase,
      carId,
      userId
    );

    if (!car) {
      return errorResponse(c, 404, "Car not found");
    }

    const body: InsuranceHistoryInput =
      await c.req.json();

    const { data, error } = await supabase
      .from("insurance_histories")
      .insert({
        car_id: carId,
        from_date: body.fromDate,
        to_date: body.toDate,
      })
      .select()
      .single();

    if (error) {
      console.error(error);

      return errorResponse(
        c,
        500,
        "Failed to create insurance history"
      );
    }

    return successResponse(
      c,
      {
        insurance: data,
      },
      201
    );

  } catch (error) {
    console.error(error);

    return errorResponse(
      c,
      500,
      "Internal server error"
    );
  }
};

//UPDATE INSURANCE HISTORY

export const updateInsuranceHistory = async (
  c: Context,
  supabase: SupabaseClient,
  userId: string
) => {
  try {
    const carId = c.req.param("carId");
    const insuranceId = c.req.param("insuranceId");

    const car = await verifyCarOwnership(
      supabase,
      carId,
      userId
    );

    if (!car) {
      return errorResponse(c, 404, "Car not found");
    }

    const body: InsuranceHistoryInput =
      await c.req.json();

    const { data, error } = await supabase
      .from("insurance_histories")
      .update({
        from_date: body.fromDate,
        to_date: body.toDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", insuranceId)
      .eq("car_id", carId)
      .select()
      .single();

    if (error) {
      console.error(error);

      return errorResponse(
        c,
        500,
        "Failed to update insurance history"
      );
    }

    return successResponse(c, {
      insurance: data,
    });

  } catch (error) {
    console.error(error);

    return errorResponse(
      c,
      500,
      "Internal server error"
    );
  }
};

//DELETE INSURANCE HISTORY

export const deleteInsuranceHistory = async (
  c: Context,
  supabase: SupabaseClient,
  userId: string
) => {
  try {
    const carId = c.req.param("carId");
    const insuranceId = c.req.param("insuranceId");

    const car = await verifyCarOwnership(
      supabase,
      carId,
      userId
    );

    if (!car) {
      return errorResponse(c, 404, "Car not found");
    }

    const { error } = await supabase
      .from("insurance_histories")
      .delete()
      .eq("id", insuranceId)
      .eq("car_id", carId);

    if (error) {
      console.error(error);

      return errorResponse(
        c,
        500,
        "Failed to delete insurance history"
      );
    }

    return successResponse(c, {
      message: "Insurance history deleted successfully",
    });

  } catch (error) {
    console.error(error);

    return errorResponse(
      c,
      500,
      "Internal server error"
    );
  }
};


//GET INSPECTION HISTORY


export const getInspectionHistory = async (
  c: Context,
  supabase: SupabaseClient,
  userId: string
) => {
  try {
    const carId = c.req.param("carId");

    const car = await verifyCarOwnership(
      supabase,
      carId,
      userId
    );

    if (!car) {
      return errorResponse(c, 404, "Car not found");
    }

    const { data, error } = await supabase
      .from("inspection_histories")
      .select("*")
      .eq("car_id", carId)
      .order("to_date", { ascending: false });

    if (error) {
      console.error(error);

      return errorResponse(
        c,
        500,
        "Failed to fetch inspection history"
      );
    }

    const records =
      data?.map(record => ({
        ...record,
        ...calculateExpiry(record.to_date),
      })) ?? [];

    return successResponse(c, {
      records,
    });

  } catch (error) {
    console.error(error);

    return errorResponse(
      c,
      500,
      "Internal server error"
    );
  }
};

//CREATE INSPECTION HISTORY

export const createInspectionHistory = async (
  c: Context,
  supabase: SupabaseClient,
  userId: string
) => {
  try {
    const carId = c.req.param("carId");

    const car = await verifyCarOwnership(
      supabase,
      carId,
      userId
    );

    if (!car) {
      return errorResponse(c, 404, "Car not found");
    }

    const body: InsuranceHistoryInput =
      await c.req.json();

    const { data, error } = await supabase
      .from("inspection_histories")
      .insert({
        car_id: carId,
        from_date: body.fromDate,
        to_date: body.toDate,
      })
      .select()
      .single();

    if (error) {
      console.error(error);

      return errorResponse(
        c,
        500,
        "Failed to create inspection history"
      );
    }

    return successResponse(
      c,
      {
        inspection: data,
      },
      201
    );

  } catch (error) {
    console.error(error);

    return errorResponse(
      c,
      500,
      "Internal server error"
    );
  }
};

//UPDATE INSPECTION HISTORY

export const updateInspectionHistory = async (
  c: Context,
  supabase: SupabaseClient,
  userId: string
) => {
  try {
    const carId = c.req.param("carId");
    const inspectionId = c.req.param("inspectionId");

    const car = await verifyCarOwnership(
      supabase,
      carId,
      userId
    );

    if (!car) {
      return errorResponse(c, 404, "Car not found");
    }

    const body: InsuranceHistoryInput =
      await c.req.json();

    const { data, error } = await supabase
      .from("inspection_histories")
      .update({
        from_date: body.fromDate,
        to_date: body.toDate,
        updated_at: new Date().toISOString(),
      })
      .eq("id", inspectionId)
      .eq("car_id", carId)
      .select()
      .single();

    if (error) {
      console.error(error);

      return errorResponse(
        c,
        500,
        "Failed to update inspection history"
      );
    }

    return successResponse(c, {
      inspection: data,
    });

  } catch (error) {
    console.error(error);

    return errorResponse(
      c,
      500,
      "Internal server error"
    );
  }
};

//DELETE INSPECTION HISTORY

export const deleteInspectionHistory = async (
  c: Context,
  supabase: SupabaseClient,
  userId: string
) => {
  try {
    const carId = c.req.param("carId");
    const inspectionId = c.req.param("inspectionId");

    const car = await verifyCarOwnership(
      supabase,
      carId,
      userId
    );

    if (!car) {
      return errorResponse(c, 404, "Car not found");
    }

    const { error } = await supabase
      .from("inspection_histories")
      .delete()
      .eq("id", inspectionId)
      .eq("car_id", carId);

    if (error) {
      console.error(error);

      return errorResponse(
        c,
        500,
        "Failed to delete inspection history"
      );
    }

    return successResponse(c, {
      message: "Inspection history deleted successfully",
    });

  } catch (error) {
    console.error(error);

    return errorResponse(
      c,
      500,
      "Internal server error"
    );
  }
};