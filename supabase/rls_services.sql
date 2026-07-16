-- RLS policies for the services table
-- Run in the Supabase SQL editor:
-- https://supabase.com/dashboard/project/oqtigtvjxpxodhgkjoqo/sql

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "services_select_own" ON public.services;
DROP POLICY IF EXISTS "services_insert_own" ON public.services;
DROP POLICY IF EXISTS "services_update_own" ON public.services;
DROP POLICY IF EXISTS "services_delete_own" ON public.services;

CREATE POLICY "services_select_own"
  ON public.services FOR SELECT
  TO authenticated
  USING (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "services_insert_own"
  ON public.services FOR INSERT
  TO authenticated
  WITH CHECK (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "services_update_own"
  ON public.services FOR UPDATE
  TO authenticated
  USING (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()))
  WITH CHECK (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "services_delete_own"
  ON public.services FOR DELETE
  TO authenticated
  USING (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));
