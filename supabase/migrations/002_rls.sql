-- =============================================================================
-- Migration 002 — Row Level Security
-- Idempotent: drops then recreates every policy.
-- Ownership model:
--   users                    → id = auth.uid()
--   cars                     → user_id = auth.uid()
--   services / reminders /
--   service_items /
--   inspection_histories /
--   insurance_histories      → car_id IN (SELECT id FROM cars WHERE user_id = auth.uid())
--   items                    → SELECT: system (user_id IS NULL) + own
--                              INSERT/UPDATE/DELETE: own only
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;

CREATE POLICY "users_select_own" ON public.users
  FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- CARS
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cars_select_own" ON public.cars;
DROP POLICY IF EXISTS "cars_insert_own" ON public.cars;
DROP POLICY IF EXISTS "cars_update_own" ON public.cars;
DROP POLICY IF EXISTS "cars_delete_own" ON public.cars;

CREATE POLICY "cars_select_own" ON public.cars
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "cars_insert_own" ON public.cars
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "cars_update_own" ON public.cars
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "cars_delete_own" ON public.cars
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- ITEMS
-- System items (user_id IS NULL): everyone can read, no one can modify.
-- User items   (user_id = uid):   owner has full CRUD.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "items_select"     ON public.items;
DROP POLICY IF EXISTS "items_insert_own" ON public.items;
DROP POLICY IF EXISTS "items_update_own" ON public.items;
DROP POLICY IF EXISTS "items_delete_own" ON public.items;

CREATE POLICY "items_select" ON public.items
  FOR SELECT TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "items_insert_own" ON public.items
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "items_update_own" ON public.items
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "items_delete_own" ON public.items
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper: car ownership sub-select (referenced by all child-table policies)
-- ─────────────────────────────────────────────────────────────────────────────
-- SERVICES
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services_select_own" ON public.services;
DROP POLICY IF EXISTS "services_insert_own" ON public.services;
DROP POLICY IF EXISTS "services_update_own" ON public.services;
DROP POLICY IF EXISTS "services_delete_own" ON public.services;

CREATE POLICY "services_select_own" ON public.services
  FOR SELECT TO authenticated
  USING (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "services_insert_own" ON public.services
  FOR INSERT TO authenticated
  WITH CHECK (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "services_update_own" ON public.services
  FOR UPDATE TO authenticated
  USING  (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()))
  WITH CHECK (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "services_delete_own" ON public.services
  FOR DELETE TO authenticated
  USING (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- SERVICE_ITEMS
-- Access comes through the parent service's car ownership.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.service_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_items_select_own" ON public.service_items;
DROP POLICY IF EXISTS "service_items_insert_own" ON public.service_items;
DROP POLICY IF EXISTS "service_items_update_own" ON public.service_items;
DROP POLICY IF EXISTS "service_items_delete_own" ON public.service_items;

CREATE POLICY "service_items_select_own" ON public.service_items
  FOR SELECT TO authenticated
  USING (service_id IN (
    SELECT s.id FROM public.services s
    JOIN public.cars c ON c.id = s.car_id
    WHERE c.user_id = auth.uid()
  ));

CREATE POLICY "service_items_insert_own" ON public.service_items
  FOR INSERT TO authenticated
  WITH CHECK (service_id IN (
    SELECT s.id FROM public.services s
    JOIN public.cars c ON c.id = s.car_id
    WHERE c.user_id = auth.uid()
  ));

CREATE POLICY "service_items_update_own" ON public.service_items
  FOR UPDATE TO authenticated
  USING (service_id IN (
    SELECT s.id FROM public.services s
    JOIN public.cars c ON c.id = s.car_id
    WHERE c.user_id = auth.uid()
  ))
  WITH CHECK (service_id IN (
    SELECT s.id FROM public.services s
    JOIN public.cars c ON c.id = s.car_id
    WHERE c.user_id = auth.uid()
  ));

CREATE POLICY "service_items_delete_own" ON public.service_items
  FOR DELETE TO authenticated
  USING (service_id IN (
    SELECT s.id FROM public.services s
    JOIN public.cars c ON c.id = s.car_id
    WHERE c.user_id = auth.uid()
  ));

-- ─────────────────────────────────────────────────────────────────────────────
-- REMINDERS
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reminders_select_own" ON public.reminders;
DROP POLICY IF EXISTS "reminders_insert_own" ON public.reminders;
DROP POLICY IF EXISTS "reminders_update_own" ON public.reminders;
DROP POLICY IF EXISTS "reminders_delete_own" ON public.reminders;

CREATE POLICY "reminders_select_own" ON public.reminders
  FOR SELECT TO authenticated
  USING (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "reminders_insert_own" ON public.reminders
  FOR INSERT TO authenticated
  WITH CHECK (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "reminders_update_own" ON public.reminders
  FOR UPDATE TO authenticated
  USING  (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()))
  WITH CHECK (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "reminders_delete_own" ON public.reminders
  FOR DELETE TO authenticated
  USING (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- INSPECTION_HISTORIES
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.inspection_histories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inspection_histories_select_own" ON public.inspection_histories;
DROP POLICY IF EXISTS "inspection_histories_insert_own" ON public.inspection_histories;
DROP POLICY IF EXISTS "inspection_histories_update_own" ON public.inspection_histories;
DROP POLICY IF EXISTS "inspection_histories_delete_own" ON public.inspection_histories;

CREATE POLICY "inspection_histories_select_own" ON public.inspection_histories
  FOR SELECT TO authenticated
  USING (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "inspection_histories_insert_own" ON public.inspection_histories
  FOR INSERT TO authenticated
  WITH CHECK (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "inspection_histories_update_own" ON public.inspection_histories
  FOR UPDATE TO authenticated
  USING  (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()))
  WITH CHECK (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "inspection_histories_delete_own" ON public.inspection_histories
  FOR DELETE TO authenticated
  USING (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- INSURANCE_HISTORIES
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.insurance_histories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insurance_histories_select_own" ON public.insurance_histories;
DROP POLICY IF EXISTS "insurance_histories_insert_own" ON public.insurance_histories;
DROP POLICY IF EXISTS "insurance_histories_update_own" ON public.insurance_histories;
DROP POLICY IF EXISTS "insurance_histories_delete_own" ON public.insurance_histories;

CREATE POLICY "insurance_histories_select_own" ON public.insurance_histories
  FOR SELECT TO authenticated
  USING (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "insurance_histories_insert_own" ON public.insurance_histories
  FOR INSERT TO authenticated
  WITH CHECK (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "insurance_histories_update_own" ON public.insurance_histories
  FOR UPDATE TO authenticated
  USING  (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()))
  WITH CHECK (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "insurance_histories_delete_own" ON public.insurance_histories
  FOR DELETE TO authenticated
  USING (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

-- ─────────────────────────────────────────────────────────────────────────────
-- CATEGORIES (legacy — same rules as items)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select"     ON public.categories;
DROP POLICY IF EXISTS "categories_insert_own" ON public.categories;
DROP POLICY IF EXISTS "categories_update_own" ON public.categories;
DROP POLICY IF EXISTS "categories_delete_own" ON public.categories;

CREATE POLICY "categories_select" ON public.categories
  FOR SELECT TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "categories_insert_own" ON public.categories
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "categories_update_own" ON public.categories
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "categories_delete_own" ON public.categories
  FOR DELETE TO authenticated USING (user_id = auth.uid());
