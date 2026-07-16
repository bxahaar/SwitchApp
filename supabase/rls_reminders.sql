-- RLS policies for the reminders table
-- Run in the Supabase SQL editor:
-- https://supabase.com/dashboard/project/oqtigtvjxpxodhgkjoqo/sql

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reminders_select_own" ON public.reminders;
DROP POLICY IF EXISTS "reminders_insert_own" ON public.reminders;
DROP POLICY IF EXISTS "reminders_update_own" ON public.reminders;
DROP POLICY IF EXISTS "reminders_delete_own" ON public.reminders;

CREATE POLICY "reminders_select_own"
  ON public.reminders FOR SELECT
  TO authenticated
  USING (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "reminders_insert_own"
  ON public.reminders FOR INSERT
  TO authenticated
  WITH CHECK (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "reminders_update_own"
  ON public.reminders FOR UPDATE
  TO authenticated
  USING (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()))
  WITH CHECK (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));

CREATE POLICY "reminders_delete_own"
  ON public.reminders FOR DELETE
  TO authenticated
  USING (car_id IN (SELECT id FROM public.cars WHERE user_id = auth.uid()));
