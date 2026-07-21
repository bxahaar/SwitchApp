import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import {
  getInsuranceHistory,
  createInsuranceHistory,
  updateInsuranceHistory,
  deleteInsuranceHistory,
  getInspectionHistory,
  createInspectionHistory,
  updateInspectionHistory,
  deleteInspectionHistory,
} from "./insurance_inspection.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Helper: Get Supabase client (service role for admin operations)
const getServiceClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  );
};

// Helper: Get Supabase client (anon key for user operations)
const getAnonClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  );
};

// Helper: Verify user from access token
const verifyUser = async (authHeader: string | null) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { error: 'Missing or invalid authorization header', userId: null };
  }
  
  const accessToken = authHeader.split(' ')[1];
  const supabase = getServiceClient();
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    console.error('Authorization error while verifying user:', error);
    return { error: 'Unauthorized', userId: null };
  }
  
  return { error: null, userId: user.id };
};


const withAuth = async (c: any, handler: (c: any, supabase: ReturnType<typeof getServiceClient>, userId: string) => Promise<Response>) => {
  const { error: authError, userId } = await verifyUser(c.req.header('Authorization'));
  if (authError || !userId) return c.json({ success: false, error: authError }, 401);
  return handler(c, getServiceClient(), userId);
};

app.get("/make-server-cd2dec47/cars/:carId/insurance", (c) => withAuth(c, getInsuranceHistory));
app.post("/make-server-cd2dec47/cars/:carId/insurance", (c) => withAuth(c, createInsuranceHistory));
app.put("/make-server-cd2dec47/cars/:carId/insurance/:insuranceId", (c) => withAuth(c, updateInsuranceHistory));
app.delete("/make-server-cd2dec47/cars/:carId/insurance/:insuranceId", (c) => withAuth(c, deleteInsuranceHistory));

app.get("/make-server-cd2dec47/cars/:carId/inspections", (c) => withAuth(c, getInspectionHistory));
app.post("/make-server-cd2dec47/cars/:carId/inspections", (c) => withAuth(c, createInspectionHistory));
app.put("/make-server-cd2dec47/cars/:carId/inspections/:inspectionId", (c) => withAuth(c, updateInspectionHistory));
app.delete("/make-server-cd2dec47/cars/:carId/inspections/:inspectionId", (c) => withAuth(c, deleteInspectionHistory));

// Health check endpoint
app.get("/make-server-cd2dec47/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============================================================================
// 1. AUTH ENDPOINTS
// ============================================================================

// Send OTP to phone number
app.post("/make-server-cd2dec47/auth/send-otp", async (c) => {
  try {
    const { phoneNumber, language = 'fa' } = await c.req.json();
    
    if (!phoneNumber) {
      return c.json({ success: false, error: 'Phone number is required' }, 400);
    }
    
    const supabase = getServiceClient();
    
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
      options: {
        channel: 'sms',
      },
    });
    
    if (error) {
      console.error('Error sending OTP:', error);
      return c.json({ success: false, error: error.message }, 400);
    }
    
    return c.json({ 
      success: true, 
      message: language === 'fa' ? 'کد تایید ارسال شد' : 'OTP sent successfully' 
    });
  } catch (error) {
    console.error('Error in send-otp endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// Verify OTP and get access token
app.post("/make-server-cd2dec47/auth/verify-otp", async (c) => {
  try {
    const { phoneNumber, otpCode } = await c.req.json();
    
    if (!phoneNumber || !otpCode) {
      return c.json({ success: false, error: 'Phone number and OTP code are required' }, 400);
    }
    
    const supabase = getServiceClient();
    
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token: otpCode,
      type: 'sms',
    });
    
    if (error) {
      console.error('Error verifying OTP:', error);
      return c.json({ success: false, error: error.message }, 400);
    }
    
    return c.json({
      success: true,
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
      user: {
        id: data.user?.id,
        phone: data.user?.phone,
      },
    });
  } catch (error) {
    console.error('Error in verify-otp endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// Refresh access token
app.post("/make-server-cd2dec47/auth/refresh", async (c) => {
  try {
    const { refreshToken } = await c.req.json();
    
    if (!refreshToken) {
      return c.json({ success: false, error: 'Refresh token is required' }, 400);
    }
    
    const supabase = getServiceClient();
    
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });
    
    if (error) {
      console.error('Error refreshing token:', error);
      return c.json({ success: false, error: error.message }, 400);
    }
    
    return c.json({
      success: true,
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
    });
  } catch (error) {
    console.error('Error in refresh endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// 2. PROFILE ENDPOINTS
// ============================================================================

// Get user profile
app.get("/make-server-cd2dec47/profile", async (c) => {
  try {
    const { error: authError, userId } = await verifyUser(c.req.header('Authorization'));
    if (authError) {
      return c.json({ success: false, error: authError }, 401);
    }
    
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return c.json({ success: false, error: 'Failed to fetch profile' }, 500);
    }
    
    return c.json(data);
  } catch (error) {
    console.error('Error in get profile endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// Update user profile
app.put("/make-server-cd2dec47/profile", async (c) => {
  try {
    const { error: authError, userId } = await verifyUser(c.req.header('Authorization'));
    if (authError) {
      return c.json({ success: false, error: authError }, 401);
    }
    
    const updates = await c.req.json();
    
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating user profile:', error);
      return c.json({ success: false, error: 'Failed to update profile' }, 500);
    }
    
    return c.json({ success: true, profile: data });
  } catch (error) {
    console.error('Error in update profile endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// 3. CARS ENDPOINTS
// ============================================================================

// Get all user's cars
app.get("/make-server-cd2dec47/cars", async (c) => {
  try {
    const { error: authError, userId } = await verifyUser(c.req.header('Authorization'));
    if (authError) {
      return c.json({ success: false, error: authError }, 401);
    }
    
    const includeInactive = c.req.query('includeInactive') === 'true';
    
    const supabase = getServiceClient();
    let query = supabase
      .from('cars')
      .select('*')
      .eq('user_id', userId)
      .order('display_order', { ascending: true });
    
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    
    const { data: cars, error } = await query;
    
    if (error) {
      console.error('Error fetching cars:', error);
      return c.json({ success: false, error: 'Failed to fetch cars' }, 500);
    }
    
    // Fetch stats for each car
    const carsWithStats = await Promise.all(cars.map(async (car) => {
      // Count total services
      const { count: servicesCount } = await supabase
        .from('services')
        .select('*', { count: 'exact', head: true })
        .eq('car_id', car.id);
      
      // Get last service date
      const { data: lastService } = await supabase
        .from('services')
        .select('service_date')
        .eq('car_id', car.id)
        .order('service_date', { ascending: false })
        .limit(1)
        .single();
      
      // Count upcoming reminders
      const { count: remindersCount } = await supabase
        .from('reminders')
        .select('*', { count: 'exact', head: true })
        .eq('car_id', car.id)
        .eq('status', 'upcoming');
      
      return {
        ...car,
        stats: {
          totalServices: servicesCount || 0,
          lastServiceDate: lastService?.service_date || null,
          upcomingReminders: remindersCount || 0,
        },
      };
    }));
    
    return c.json({ cars: carsWithStats });
  } catch (error) {
    console.error('Error in get cars endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// Get single car
app.get("/make-server-cd2dec47/cars/:carId", async (c) => {
  try {
    const { error: authError, userId } = await verifyUser(c.req.header('Authorization'));
    if (authError) {
      return c.json({ success: false, error: authError }, 401);
    }
    
    const carId = c.req.param('carId');
    const supabase = getServiceClient();
    
    const { data: car, error } = await supabase
      .from('cars')
      .select('*')
      .eq('id', carId)
      .eq('user_id', userId)
      .single();
    
    if (error || !car) {
      return c.json({ success: false, error: 'Car not found' }, 404);
    }
    
    // Get current insurance
    const { data: insurance } = await supabase
      .from('insurance_histories')
      .select('id, car_id, start_date, end_date, created_at, updated_at')
      .eq('car_id', carId)
      .order('end_date', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();
    
    // Get current technical inspection
    const { data: inspection } = await supabase
      .from('inspection_histories')
      .select('id, car_id, start_date, end_date, created_at, updated_at')
      .eq('car_id', carId)
      .order('end_date', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle();
    
    // Calculate days until expiry
    const insuranceWithDays = insurance ? {
      ...insurance,
      daysUntilExpiry: Math.ceil((new Date(insurance.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    } : null;
    
    const inspectionWithDays = inspection ? {
      ...inspection,
      daysUntilExpiry: Math.ceil((new Date(inspection.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    } : null;
    
    return c.json({
      ...car,
      insurance: insuranceWithDays,
      technicalInspection: inspectionWithDays,
    });
  } catch (error) {
    console.error('Error in get car endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// Create new car
app.post("/make-server-cd2dec47/cars", async (c) => {
  try {
    const { error: authError, userId } = await verifyUser(c.req.header('Authorization'));
    if (authError) {
      return c.json({ success: false, error: authError }, 401);
    }
    
    const carData = await c.req.json();
    
    if (!carData.brand || !carData.model) {
      return c.json({ success: false, error: 'Brand and model are required' }, 400);
    }
    
    const supabase = getServiceClient();
    
    // Get max display_order for this user
    const { data: maxOrderCar } = await supabase
      .from('cars')
      .select('display_order')
      .eq('user_id', userId)
      .order('display_order', { ascending: false })
      .limit(1)
      .single();
    
    const nextOrder = (maxOrderCar?.display_order ?? -1) + 1;
    
    const { data, error } = await supabase
      .from('cars')
      .insert({
        ...carData,
        user_id: userId,
        display_order: nextOrder,
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating car:', error);
      return c.json({ success: false, error: 'Failed to create car' }, 500);
    }
    
    return c.json({ success: true, car: data });
  } catch (error) {
    console.error('Error in create car endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// Update car
app.put("/make-server-cd2dec47/cars/:carId", async (c) => {
  try {
    const { error: authError, userId } = await verifyUser(c.req.header('Authorization'));
    if (authError) {
      return c.json({ success: false, error: authError }, 401);
    }
    
    const carId = c.req.param('carId');
    const updates = await c.req.json();
    
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('cars')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', carId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating car:', error);
      return c.json({ success: false, error: 'Failed to update car' }, 500);
    }
    
    return c.json({ success: true, car: data });
  } catch (error) {
    console.error('Error in update car endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// Delete car
app.delete("/make-server-cd2dec47/cars/:carId", async (c) => {
  try {
    const { error: authError, userId } = await verifyUser(c.req.header('Authorization'));
    if (authError) {
      return c.json({ success: false, error: authError }, 401);
    }
    
    const carId = c.req.param('carId');
    const permanent = c.req.query('permanent') === 'true';
    
    const supabase = getServiceClient();
    
    if (permanent) {
      const { error } = await supabase
        .from('cars')
        .delete()
        .eq('id', carId)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error deleting car:', error);
        return c.json({ success: false, error: 'Failed to delete car' }, 500);
      }
    } else {
      // Soft delete
      const { error } = await supabase
        .from('cars')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', carId)
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error soft deleting car:', error);
        return c.json({ success: false, error: 'Failed to delete car' }, 500);
      }
    }
    
    return c.json({ success: true, message: 'Car deleted successfully' });
  } catch (error) {
    console.error('Error in delete car endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// 4. SERVICE CATEGORIES ENDPOINTS (Read-only)
// ============================================================================

// Get all service categories
app.get("/make-server-cd2dec47/service-categories", async (c) => {
  try {
    const language = c.req.query('language') || 'fa';
    
    const supabase = getAnonClient();
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching service categories:', error);
      return c.json({ success: false, error: 'Failed to fetch categories' }, 500);
    }
    
    return c.json({ categories: data });
  } catch (error) {
    console.error('Error in get service categories endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// Get checklist items for a category
app.get("/make-server-cd2dec47/service-categories/:categoryId/checklist", async (c) => {
  try {
    const categoryId = c.req.param('categoryId');
    const language = c.req.query('language') || 'fa';
    
    const supabase = getAnonClient();
    const { data, error } = await supabase
      .from('service_checklist_items')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching checklist items:', error);
      return c.json({ success: false, error: 'Failed to fetch items' }, 500);
    }
    
    return c.json({ items: data });
  } catch (error) {
    console.error('Error in get checklist items endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// 5. INSIGHTS / BLOG ENDPOINTS
// ============================================================================

// Get published blog posts
app.get("/make-server-cd2dec47/insights", async (c) => {
  try {
    const language = c.req.query('language') || 'fa';
    const category = c.req.query('category');
    const featured = c.req.query('featured') === 'true';
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');
    
    const supabase = getAnonClient();
    
    let query = supabase
      .from('blog_posts')
      .select('*', { count: 'exact' })
      .eq('is_published', true)
      .order('published_at', { ascending: false });
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (featured) {
      query = query.eq('featured', true);
    }
    
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Error fetching blog posts:', error);
      return c.json({ success: false, error: 'Failed to fetch posts' }, 500);
    }
    
    return c.json({
      posts: data,
      pagination: {
        total: count || 0,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Error in get insights endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// Get single blog post
app.get("/make-server-cd2dec47/insights/:postId", async (c) => {
  try {
    const postId = c.req.param('postId');
    const language = c.req.query('language') || 'fa';
    
    const supabase = getAnonClient();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', postId)
      .eq('is_published', true)
      .single();
    
    if (error || !data) {
      return c.json({ success: false, error: 'Post not found' }, 404);
    }
    
    return c.json(data);
  } catch (error) {
    console.error('Error in get single post endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

// ============================================================================
// 6. DASHBOARD ENDPOINT
// ============================================================================

// Get comprehensive dashboard data
app.get("/make-server-cd2dec47/dashboard", async (c) => {
  try {
    const { error: authError, userId } = await verifyUser(c.req.header('Authorization'));
    if (authError) {
      return c.json({ success: false, error: authError }, 401);
    }
    
    const supabase = getServiceClient();
    
    // Get all active cars
    const { data: cars } = await supabase
      .from('cars')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    // Get car stats
    const carsWithDetails = await Promise.all((cars || []).map(async (car) => {
      // Last service date
      const { data: lastService } = await supabase
        .from('services')
        .select('service_date')
        .eq('car_id', car.id)
        .order('service_date', { ascending: false })
        .limit(1)
        .single();
      
      // Upcoming reminders count
      const { count: remindersCount } = await supabase
        .from('reminders')
        .select('*', { count: 'exact', head: true })
        .eq('car_id', car.id)
        .eq('status', 'upcoming');
      
      // Current insurance
      const { data: insurance } = await supabase
        .from('insurance_histories')
        .select('id, car_id, start_date, end_date, created_at, updated_at')
        .eq('car_id', car.id)
        .order('end_date', { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();
      
      // Current technical inspection
      const { data: inspection } = await supabase
        .from('inspection_histories')
        .select('id, car_id, start_date, end_date, created_at, updated_at')
        .eq('car_id', car.id)
        .order('end_date', { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();
      
      const insuranceWithDays = insurance ? {
        endDate: insurance.end_date,
        daysUntilExpiry: Math.ceil((new Date(insurance.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        isExpiringSoon: Math.ceil((new Date(insurance.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 30,
      } : null;
      
      const inspectionWithDays = inspection ? {
        endDate: inspection.end_date,
        daysUntilExpiry: Math.ceil((new Date(inspection.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        isExpiringSoon: Math.ceil((new Date(inspection.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) <= 30,
      } : null;
      
      return {
        ...car,
        lastServiceDate: lastService?.service_date || null,
        upcomingReminders: remindersCount || 0,
        insurance: insuranceWithDays,
        technicalInspection: inspectionWithDays,
      };
    }));
    
    // Get upcoming reminders (top 5 across all cars)
    const { data: upcomingReminders } = await supabase
      .from('reminders')
      .select(`
        *,
        car:cars!inner(id, brand, model, license_plate),
        category:service_categories(id, name_fa, name_en, icon, color)
      `)
      .eq('user_id', userId)
      .eq('status', 'upcoming')
      .order('due_date', { ascending: true, nullsFirst: false })
      .limit(5);
    
    // Get recent services (last 10 across all cars)
    const { data: recentServices } = await supabase
      .from('services')
      .select(`
        *,
        car:cars!inner(id, brand, model, license_plate),
        category:service_categories(id, name_fa, name_en, icon, color)
      `)
      .eq('user_id', userId)
      .order('service_date', { ascending: false })
      .limit(10);
    
    // Collect alerts
    const alerts: any[] = [];
    carsWithDetails.forEach((car) => {
      if (car.insurance?.isExpiringSoon) {
        alerts.push({
          type: 'insurance_expiring',
          carId: car.id,
          message: `بیمه ${car.brand} ${car.model} تا ${car.insurance.daysUntilExpiry} روز دیگر منقضی می‌شود`,
          severity: 'warning',
          daysUntil: car.insurance.daysUntilExpiry,
        });
      }
      if (car.technicalInspection?.isExpiringSoon) {
        alerts.push({
          type: 'inspection_expiring',
          carId: car.id,
          message: `معاینه فنی ${car.brand} ${car.model} تا ${car.technicalInspection.daysUntilExpiry} روز دیگر منقضی می‌شود`,
          severity: 'warning',
          daysUntil: car.technicalInspection.daysUntilExpiry,
        });
      }
    });
    
    // Calculate stats
    const { count: totalServices } = await supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    const currentYear = new Date().getFullYear();
    const { data: yearServices } = await supabase
      .from('services')
      .select('cost')
      .eq('user_id', userId)
      .gte('service_date', `${currentYear}-01-01`)
      .lte('service_date', `${currentYear}-12-31`);
    
    const totalCostThisYear = (yearServices || []).reduce((sum, s) => sum + (parseFloat(s.cost as string) || 0), 0);
    
    const { count: upcomingRemindersCount } = await supabase
      .from('reminders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'upcoming');
    
    return c.json({
      cars: carsWithDetails,
      upcomingReminders: upcomingReminders || [],
      recentServices: recentServices || [],
      alerts,
      stats: {
        totalCars: carsWithDetails.length,
        totalServices: totalServices || 0,
        totalCostThisYear,
        upcomingRemindersCount: upcomingRemindersCount || 0,
      },
    });
  } catch (error) {
    console.error('Error in dashboard endpoint:', error);
    return c.json({ success: false, error: 'Internal server error' }, 500);
  }
});

Deno.serve(app.fetch);
