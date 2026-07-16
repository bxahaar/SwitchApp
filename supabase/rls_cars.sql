-- RLS policies for the cars table
-- Run in the Supabase SQL editor:
-- https://supabase.com/dashboard/project/oqtigtvjxpxodhgkjoqo/sql

ALTER TABLE public.cars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cars_select_own" ON public.cars;
DROP POLICY IF EXISTS "cars_insert_own" ON public.cars;
DROP POLICY IF EXISTS "cars_update_own" ON public.cars;
DROP POLICY IF EXISTS "cars_delete_own" ON public.cars;

CREATE POLICY "cars_select_own"
  ON public.cars FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "cars_insert_own"
  ON public.cars FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "cars_update_own"
  ON public.cars FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "cars_delete_own"
  ON public.cars FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
