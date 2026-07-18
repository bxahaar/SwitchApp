-- Migration: add missing columns to inspection_histories and insurance_histories.
-- The tables exist but only have id, car_id, created_at, updated_at.
-- Run in the Supabase SQL editor:
-- https://supabase.com/dashboard/project/oqtigtvjxpxodhgkjoqo/sql

-- ── inspection_histories ──────────────────────────────────────────────────────

ALTER TABLE public.inspection_histories
  ADD COLUMN IF NOT EXISTS start_date  date,
  ADD COLUMN IF NOT EXISTS end_date    date,
  ADD COLUMN IF NOT EXISTS status      text CHECK (status IN ('active','expired','pending')),
  ADD COLUMN IF NOT EXISTS notes       text,
  ADD COLUMN IF NOT EXISTS center      text,
  ADD COLUMN IF NOT EXISTS cost        numeric(15,0);

-- Index for fast lookup by car
CREATE INDEX IF NOT EXISTS inspection_histories_car_id_idx
  ON public.inspection_histories (car_id);

-- ── insurance_histories ───────────────────────────────────────────────────────

ALTER TABLE public.insurance_histories
  ADD COLUMN IF NOT EXISTS start_date    date,
  ADD COLUMN IF NOT EXISTS end_date      date,
  ADD COLUMN IF NOT EXISTS status        text CHECK (status IN ('active','expired','pending')),
  ADD COLUMN IF NOT EXISTS notes         text,
  ADD COLUMN IF NOT EXISTS provider      text,
  ADD COLUMN IF NOT EXISTS policy_number text,
  ADD COLUMN IF NOT EXISTS cost          numeric(15,0);

-- Index for fast lookup by car
CREATE INDEX IF NOT EXISTS insurance_histories_car_id_idx
  ON public.insurance_histories (car_id);
