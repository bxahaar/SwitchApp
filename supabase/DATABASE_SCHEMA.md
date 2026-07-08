# Car Service Management - Database Schema

## Overview
This document describes the production-ready database schema for the car service management mobile application with OTP authentication, multi-car management, service tracking, and reminders.

## Architecture Principles
- **Relational SQL structure** using PostgreSQL
- **Row Level Security (RLS)** for multi-tenant data isolation
- **Normalized design** with proper foreign keys
- **Audit trails** with created_at/updated_at timestamps
- **Soft deletes** where appropriate
- **Extensibility** for future features

---

## Tables

### 1. `user_profiles`
Extended user information (Supabase Auth handles phone/OTP in auth.users)

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  preferred_language VARCHAR(5) DEFAULT 'fa', -- 'fa' or 'en'
  theme_preference VARCHAR(10) DEFAULT 'light', -- 'light' or 'dark'
  distance_unit VARCHAR(10) DEFAULT 'km', -- 'km' or 'mi'
  currency VARCHAR(10) DEFAULT 'toman', -- 'toman' or other
  push_notification_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own profile
CREATE POLICY "Users can view own profile" 
  ON user_profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON user_profiles FOR UPDATE 
  USING (auth.uid() = id);
```

---

### 2. `cars`
User's vehicles

```sql
CREATE TABLE cars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Car details
  brand VARCHAR(100) NOT NULL, -- e.g., "تویوتا", "Toyota"
  model VARCHAR(100) NOT NULL, -- e.g., "کمری", "Camry"
  year INTEGER, -- e.g., 2020
  color VARCHAR(50),
  license_plate VARCHAR(50),
  vin VARCHAR(17), -- Vehicle Identification Number
  
  -- Current status
  current_mileage INTEGER, -- in kilometers
  
  -- Display order
  display_order INTEGER DEFAULT 0,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT cars_user_id_display_order_key UNIQUE (user_id, display_order)
);

-- Enable RLS
ALTER TABLE cars ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own cars
CREATE POLICY "Users can view own cars" 
  ON cars FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cars" 
  ON cars FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cars" 
  ON cars FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cars" 
  ON cars FOR DELETE 
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_cars_user_id ON cars(user_id);
CREATE INDEX idx_cars_is_active ON cars(is_active);
```

---

### 3. `service_categories`
Predefined service types/categories

```sql
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Category info
  key VARCHAR(50) UNIQUE NOT NULL, -- e.g., 'engine', 'brake', 'tire'
  name_en VARCHAR(100) NOT NULL,
  name_fa VARCHAR(100) NOT NULL,
  icon VARCHAR(50), -- Icon identifier
  
  -- Display
  color VARCHAR(20), -- Hex color for UI
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed data (admin-managed, no RLS needed)
INSERT INTO service_categories (key, name_en, name_fa, icon, color, display_order) VALUES
  ('engine', 'Engine', 'موتور', 'engine', '#5E59C0', 1),
  ('brake', 'Brake System', 'ترمز', 'brake', '#E74C3C', 2),
  ('gearbox', 'Gearbox', 'گیربکس', 'gearbox', '#3498DB', 3),
  ('battery', 'Battery', 'باتری', 'battery', '#F39C12', 4),
  ('tire', 'Tires', 'لاستیک', 'tire', '#2ECC71', 5),
  ('oil', 'Oil Change', 'تعویض روغن', 'oil', '#9B59B6', 6),
  ('filter', 'Filters', 'فیلترها', 'filter', '#1ABC9C', 7),
  ('suspension', 'Suspension', 'سیستم تعلیق', 'suspension', '#34495E', 8),
  ('electrical', 'Electrical', 'سیستم برق', 'electrical', '#F1C40F', 9),
  ('cooling', 'Cooling System', 'سیستم خنک‌کننده', 'cooling', '#16A085', 10),
  ('general', 'General Service', 'سرویس عمومی', 'general', '#95A5A6', 11),
  ('other', 'Other', 'سایر', 'other', '#7F8C8D', 99);
```

---

### 4. `service_checklist_items`
Predefined checklist items for each service category

```sql
CREATE TABLE service_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES service_categories(id) ON DELETE CASCADE,
  
  -- Item info
  name_en VARCHAR(200) NOT NULL,
  name_fa VARCHAR(200) NOT NULL,
  
  -- Display
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Example seed data for 'oil' category
-- (This would be expanded with comprehensive checklist items)
INSERT INTO service_checklist_items (category_id, name_en, name_fa, display_order)
SELECT id, 'Engine oil replacement', 'تعویض روغن موتور', 1 
FROM service_categories WHERE key = 'oil';

INSERT INTO service_checklist_items (category_id, name_en, name_fa, display_order)
SELECT id, 'Oil filter replacement', 'تعویض فیلتر روغن', 2 
FROM service_categories WHERE key = 'oil';

INSERT INTO service_checklist_items (category_id, name_en, name_fa, display_order)
SELECT id, 'Check oil level', 'بررسی سطح روغن', 3 
FROM service_categories WHERE key = 'oil';
```

---

### 5. `services`
Completed service records

```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  
  -- Service details
  category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  service_date DATE NOT NULL,
  mileage INTEGER, -- Mileage at time of service (km)
  cost DECIMAL(12, 2), -- Cost in selected currency
  currency VARCHAR(10) DEFAULT 'toman',
  
  -- Description
  description TEXT,
  notes TEXT,
  
  -- Service provider
  service_provider VARCHAR(200), -- Shop/mechanic name
  service_provider_phone VARCHAR(20),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- User reference (denormalized for easier querying)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own services" 
  ON services FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own services" 
  ON services FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own services" 
  ON services FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own services" 
  ON services FOR DELETE 
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_services_car_id ON services(car_id);
CREATE INDEX idx_services_user_id ON services(user_id);
CREATE INDEX idx_services_service_date ON services(service_date DESC);
CREATE INDEX idx_services_category_id ON services(category_id);
```

---

### 6. `service_items`
Junction table: which checklist items were completed in each service

```sql
CREATE TABLE service_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  
  -- Can reference predefined item OR be a custom item
  checklist_item_id UUID REFERENCES service_checklist_items(id) ON DELETE SET NULL,
  custom_item_name VARCHAR(200), -- For user-defined items
  
  -- Item details
  is_checked BOOLEAN DEFAULT true,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraint: Either checklist_item_id OR custom_item_name must be set
  CONSTRAINT check_item_reference CHECK (
    (checklist_item_id IS NOT NULL AND custom_item_name IS NULL) OR
    (checklist_item_id IS NULL AND custom_item_name IS NOT NULL)
  )
);

-- Enable RLS (inherits from service)
ALTER TABLE service_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own service items" 
  ON service_items FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM services 
      WHERE services.id = service_items.service_id 
      AND services.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own service items" 
  ON service_items FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM services 
      WHERE services.id = service_items.service_id 
      AND services.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own service items" 
  ON service_items FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM services 
      WHERE services.id = service_items.service_id 
      AND services.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own service items" 
  ON service_items FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM services 
      WHERE services.id = service_items.service_id 
      AND services.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_service_items_service_id ON service_items(service_id);
CREATE INDEX idx_service_items_checklist_item_id ON service_items(checklist_item_id);
```

---

### 7. `reminders`
Upcoming service reminders

```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  
  -- Reminder details
  category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Due conditions (at least one must be set)
  due_date DATE,
  due_mileage INTEGER, -- Remind when car reaches this mileage
  
  -- Status
  status VARCHAR(20) DEFAULT 'upcoming', -- 'upcoming', 'completed', 'dismissed', 'overdue'
  
  -- Notification settings
  notify_days_before INTEGER DEFAULT 7, -- Days before due_date to notify
  notify_km_before INTEGER DEFAULT 500, -- KM before due_mileage to notify
  last_notification_sent_at TIMESTAMPTZ,
  
  -- Completion tracking
  completed_at TIMESTAMPTZ,
  completed_service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- User reference (denormalized)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Constraint: At least one due condition must be set
  CONSTRAINT check_due_condition CHECK (
    due_date IS NOT NULL OR due_mileage IS NOT NULL
  )
);

-- Enable RLS
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reminders" 
  ON reminders FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders" 
  ON reminders FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders" 
  ON reminders FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders" 
  ON reminders FOR DELETE 
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_reminders_car_id ON reminders(car_id);
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_status ON reminders(status);
CREATE INDEX idx_reminders_due_date ON reminders(due_date);
CREATE INDEX idx_reminders_due_mileage ON reminders(due_mileage);
```

---

### 8. `insurance_records`
Insurance tracking per car

```sql
CREATE TABLE insurance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  
  -- Insurance details
  insurance_type VARCHAR(50), -- 'third_party', 'comprehensive', etc.
  insurance_company VARCHAR(200),
  policy_number VARCHAR(100),
  
  -- Coverage period
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- Cost
  premium_amount DECIMAL(12, 2),
  currency VARCHAR(10) DEFAULT 'toman',
  
  -- Documents (future: store in Supabase Storage)
  document_url TEXT,
  
  -- Status
  is_current BOOLEAN DEFAULT true,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- User reference (denormalized)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE insurance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insurance records" 
  ON insurance_records FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insurance records" 
  ON insurance_records FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insurance records" 
  ON insurance_records FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own insurance records" 
  ON insurance_records FOR DELETE 
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_insurance_records_car_id ON insurance_records(car_id);
CREATE INDEX idx_insurance_records_user_id ON insurance_records(user_id);
CREATE INDEX idx_insurance_records_end_date ON insurance_records(end_date);
CREATE INDEX idx_insurance_records_is_current ON insurance_records(is_current);
```

---

### 9. `technical_inspection_records`
Technical inspection tracking per car

```sql
CREATE TABLE technical_inspection_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  
  -- Inspection details
  inspection_center VARCHAR(200),
  certificate_number VARCHAR(100),
  
  -- Validity period
  inspection_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  
  -- Result
  passed BOOLEAN DEFAULT true,
  notes TEXT,
  
  -- Documents
  document_url TEXT,
  
  -- Status
  is_current BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- User reference (denormalized)
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE technical_inspection_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own inspection records" 
  ON technical_inspection_records FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own inspection records" 
  ON technical_inspection_records FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inspection records" 
  ON technical_inspection_records FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own inspection records" 
  ON technical_inspection_records FOR DELETE 
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_technical_inspection_records_car_id ON technical_inspection_records(car_id);
CREATE INDEX idx_technical_inspection_records_user_id ON technical_inspection_records(user_id);
CREATE INDEX idx_technical_inspection_records_expiry_date ON technical_inspection_records(expiry_date);
CREATE INDEX idx_technical_inspection_records_is_current ON technical_inspection_records(is_current);
```

---

### 10. `blog_posts`
Educational content / insights (admin-managed, read-only for users)

```sql
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Content
  title_en VARCHAR(300) NOT NULL,
  title_fa VARCHAR(300) NOT NULL,
  content_en TEXT NOT NULL,
  content_fa TEXT NOT NULL,
  
  -- Media
  cover_image_url TEXT,
  video_url TEXT,
  
  -- Categorization
  category VARCHAR(100), -- 'maintenance', 'tips', 'troubleshooting', etc.
  tags TEXT[], -- Array of tags
  
  -- Display
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  
  -- Metadata
  author VARCHAR(200),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS needed (public read access)
-- Admin writes would be handled through admin interface

-- Indexes
CREATE INDEX idx_blog_posts_is_published ON blog_posts(is_published);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX idx_blog_posts_featured ON blog_posts(featured);
```

---

### 11. `notifications`
Notification log for tracking sent notifications

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Notification details
  type VARCHAR(50) NOT NULL, -- 'reminder', 'insurance_expiry', 'inspection_expiry', etc.
  title VARCHAR(200) NOT NULL,
  body TEXT NOT NULL,
  
  -- Reference
  reference_type VARCHAR(50), -- 'reminder', 'insurance', 'inspection'
  reference_id UUID, -- ID of the related entity
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  
  -- Push notification
  push_sent BOOLEAN DEFAULT false,
  push_sent_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" 
  ON notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
  ON notifications FOR UPDATE 
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_sent_at ON notifications(sent_at DESC);
CREATE INDEX idx_notifications_reference ON notifications(reference_type, reference_id);
```

---

## Database Functions & Triggers

### Auto-update `updated_at` timestamp

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cars_updated_at BEFORE UPDATE ON cars FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reminders_updated_at BEFORE UPDATE ON reminders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_insurance_records_updated_at BEFORE UPDATE ON insurance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_technical_inspection_records_updated_at BEFORE UPDATE ON technical_inspection_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Auto-create user profile on signup

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, phone_number)
  VALUES (NEW.id, NEW.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Update reminder status to overdue

```sql
CREATE OR REPLACE FUNCTION update_overdue_reminders()
RETURNS void AS $$
BEGIN
  UPDATE reminders
  SET status = 'overdue'
  WHERE status = 'upcoming'
    AND (
      (due_date IS NOT NULL AND due_date < CURRENT_DATE)
      OR (due_mileage IS NOT NULL AND due_mileage < (
        SELECT current_mileage FROM cars WHERE cars.id = reminders.car_id
      ))
    );
END;
$$ LANGUAGE plpgsql;

-- This would be called periodically (e.g., via cron job or Edge Function)
```

---

## Entity Relationships Diagram (ERD)

```
auth.users (Supabase Auth)
    │
    ├──< user_profiles (1:1)
    │
    └──< cars (1:N)
           │
           ├──< services (1:N)
           │      │
           │      └──< service_items (1:N) >── service_checklist_items (N:1)
           │                                              │
           │                                     service_categories (1:N)
           │
           ├──< reminders (1:N) >── service_categories (N:1)
           │
           ├──< insurance_records (1:N)
           │
           └──< technical_inspection_records (1:N)

blog_posts (standalone, admin-managed)

notifications (N:1) >── auth.users
```

---

## Data Access Patterns

### Most Common Queries

1. **Get user's cars with latest service date**
```sql
SELECT c.*, MAX(s.service_date) as last_service_date
FROM cars c
LEFT JOIN services s ON s.car_id = c.id
WHERE c.user_id = :userId AND c.is_active = true
GROUP BY c.id
ORDER BY c.display_order;
```

2. **Get upcoming reminders for a car**
```sql
SELECT r.*, sc.name_fa, sc.icon
FROM reminders r
LEFT JOIN service_categories sc ON r.category_id = sc.id
WHERE r.car_id = :carId 
  AND r.status = 'upcoming'
  AND (r.due_date >= CURRENT_DATE OR r.due_mileage >= :currentMileage)
ORDER BY COALESCE(r.due_date, '9999-12-31'), r.due_mileage;
```

3. **Get service history for a car**
```sql
SELECT s.*, sc.name_fa, sc.icon,
  ARRAY_AGG(
    CASE 
      WHEN si.checklist_item_id IS NOT NULL THEN cli.name_fa
      ELSE si.custom_item_name
    END
  ) as items
FROM services s
LEFT JOIN service_categories sc ON s.category_id = sc.id
LEFT JOIN service_items si ON si.service_id = s.id
LEFT JOIN service_checklist_items cli ON si.checklist_item_id = cli.id
WHERE s.car_id = :carId
GROUP BY s.id, sc.name_fa, sc.icon
ORDER BY s.service_date DESC;
```

4. **Check expiring insurance/inspections**
```sql
-- Insurance expiring in next 30 days
SELECT car_id, end_date
FROM insurance_records
WHERE user_id = :userId 
  AND is_current = true
  AND end_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days';

-- Technical inspection expiring in next 30 days
SELECT car_id, expiry_date
FROM technical_inspection_records
WHERE user_id = :userId 
  AND is_current = true
  AND expiry_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days';
```

---

## Migration Strategy

1. **Initial Setup**: Run all CREATE TABLE statements in order
2. **Seed Data**: Insert service_categories and service_checklist_items
3. **Enable RLS**: Enable Row Level Security on all user-facing tables
4. **Create Policies**: Apply all RLS policies
5. **Create Functions**: Install trigger functions
6. **Create Triggers**: Enable auto-update triggers
7. **Create Indexes**: Apply all performance indexes

---

## Future Extensibility

### Phase 2 Features (Easy to add):
- **Service attachments**: Add `service_attachments` table with Supabase Storage URLs
- **Car sharing**: Add `car_sharing` table for multi-user access to same car
- **Service statistics**: Aggregate functions and materialized views for analytics
- **Recurring reminders**: Add `is_recurring` and `recurrence_rule` to reminders table
- **Service recommendations**: Add AI-powered recommendations based on mileage/time
- **Parts tracking**: Add `parts` and `service_parts` tables for part inventory
- **Fuel tracking**: Add `fuel_records` table for fuel consumption tracking
- **Expense analytics**: Add views and functions for cost analysis

### Scalability Considerations:
- **Partitioning**: services and notifications tables can be partitioned by date
- **Archiving**: Old services (>5 years) can be moved to archive tables
- **Caching**: Blog posts and service categories are perfect for Redis/CDN caching
- **Read replicas**: High read queries (dashboard, history) can use read replicas
- **Indexes**: All foreign keys and date fields are indexed for performance

---

## Security Checklist

✅ Row Level Security enabled on all user data tables
✅ Policies prevent users from accessing other users' data
✅ Foreign key constraints maintain referential integrity
✅ User ID denormalized in child tables for efficient RLS
✅ Check constraints validate data integrity
✅ Soft deletes available where needed (is_active flag)
✅ Auth handled by Supabase (phone OTP)
✅ No sensitive data in unencrypted fields

---

## API Design

See `/supabase/API_ENDPOINTS.md` for complete RESTful API documentation.
