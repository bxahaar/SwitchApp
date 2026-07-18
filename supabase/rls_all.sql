-- Complete Row Level Security policies for all application tables.
-- Run in the Supabase SQL editor:
-- https://supabase.com/dashboard/project/oqtigtvjxpxodhgkjoqo/sql
--
-- Ownership model:
--   users              → users.id = auth.uid()
--   cars               → cars.user_id = auth.uid()
--   services/reminders → car_id IN (SELECT id FROM cars WHERE user_id = auth.uid())
--   inspection_histories / insurance_histories → same car-based ownership
--   categories         → system (user_id IS NULL, readable by all)
--                        or user-owned (user_id = auth.uid())

-- ─────────────────────────────────────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

CREATE POLICY "users_select_own"
  ON public.users FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "users_insert_own"
  ON public.users FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- CARS
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cars_select_own"  ON public.cars;
DROP POLICY IF EXISTS "cars_insert_own"  ON public.cars;
DROP POLICY IF EXISTS "cars_update_own"  ON public.cars;
DROP POLICY IF EXISTS "cars_delete_own"  ON public.cars;

CREATE POLICY "cars_select_own"
  ON public.cars FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "cars_insert_own"
  ON public.cars FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "cars_update_own"
  ON public.cars FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "cars_delete_own"
  ON public.cars FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- SERVICES
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services_select_own"  ON public.services;
DROP POLICY IF EXISTS "services_insert_own"  ON public.services;
DROP POLICY IF EXISTS "services_update_own"  ON public.services;
DROP POLICY IF EXISTS "services_delete_own"  ON public.services;

CREATE POLICY "services_select_own"
  ON public.services FOR SELECT TO authenticated
  USING (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "services_insert_own"
  ON public.services FOR INSERT TO authenticated
  WITH CHECK (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "services_update_own"
  ON public.services FOR UPDATE TO authenticated
  USING  (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()))
  WITH CHECK (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "services_delete_own"
  ON public.services FOR DELETE TO authenticated
  USING (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- REMINDERS
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reminders_select_own"  ON public.reminders;
DROP POLICY IF EXISTS "reminders_insert_own"  ON public.reminders;
DROP POLICY IF EXISTS "reminders_update_own"  ON public.reminders;
DROP POLICY IF EXISTS "reminders_delete_own"  ON public.reminders;

CREATE POLICY "reminders_select_own"
  ON public.reminders FOR SELECT TO authenticated
  USING (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "reminders_insert_own"
  ON public.reminders FOR INSERT TO authenticated
  WITH CHECK (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "reminders_update_own"
  ON public.reminders FOR UPDATE TO authenticated
  USING  (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()))
  WITH CHECK (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "reminders_delete_own"
  ON public.reminders FOR DELETE TO authenticated
  USING (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- INSPECTION_HISTORIES
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.inspection_histories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inspection_histories_select_own"  ON public.inspection_histories;
DROP POLICY IF EXISTS "inspection_histories_insert_own"  ON public.inspection_histories;
DROP POLICY IF EXISTS "inspection_histories_update_own"  ON public.inspection_histories;
DROP POLICY IF EXISTS "inspection_histories_delete_own"  ON public.inspection_histories;

CREATE POLICY "inspection_histories_select_own"
  ON public.inspection_histories FOR SELECT TO authenticated
  USING (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "inspection_histories_insert_own"
  ON public.inspection_histories FOR INSERT TO authenticated
  WITH CHECK (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "inspection_histories_update_own"
  ON public.inspection_histories FOR UPDATE TO authenticated
  USING  (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()))
  WITH CHECK (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "inspection_histories_delete_own"
  ON public.inspection_histories FOR DELETE TO authenticated
  USING (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- INSURANCE_HISTORIES
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.insurance_histories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insurance_histories_select_own"  ON public.insurance_histories;
DROP POLICY IF EXISTS "insurance_histories_insert_own"  ON public.insurance_histories;
DROP POLICY IF EXISTS "insurance_histories_update_own"  ON public.insurance_histories;
DROP POLICY IF EXISTS "insurance_histories_delete_own"  ON public.insurance_histories;

CREATE POLICY "insurance_histories_select_own"
  ON public.insurance_histories FOR SELECT TO authenticated
  USING (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "insurance_histories_insert_own"
  ON public.insurance_histories FOR INSERT TO authenticated
  WITH CHECK (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "insurance_histories_update_own"
  ON public.insurance_histories FOR UPDATE TO authenticated
  USING  (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()))
  WITH CHECK (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "insurance_histories_delete_own"
  ON public.insurance_histories FOR DELETE TO authenticated
  USING (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- CATEGORIES
-- System categories: user_id IS NULL → readable by all authenticated users, immutable.
-- User categories:   user_id = auth.uid() → full CRUD by owner only.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select"        ON public.categories;
DROP POLICY IF EXISTS "categories_insert_own"    ON public.categories;
DROP POLICY IF EXISTS "categories_update_own"    ON public.categories;
DROP POLICY IF EXISTS "categories_delete_own"    ON public.categories;

-- SELECT: system categories (user_id IS NULL) + own user categories
CREATE POLICY "categories_select"
  ON public.categories FOR SELECT TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid());

-- INSERT: only user-owned categories; user_id must equal the caller
CREATE POLICY "categories_insert_own"
  ON public.categories FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- UPDATE: only own user categories; cannot touch system categories (user_id IS NULL)
CREATE POLICY "categories_update_own"
  ON public.categories FOR UPDATE TO authenticated
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- DELETE: only own user categories; cannot delete system categories
CREATE POLICY "categories_delete_own"
  ON public.categories FOR DELETE TO authenticated
  USING (user_id = auth.uid());
