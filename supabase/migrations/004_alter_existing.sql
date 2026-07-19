-- 004_alter_existing.sql
-- Adds columns to inspection_histories and insurance_histories that were
-- created before the migration system existed (only had id, car_id, timestamps).
-- All additions are idempotent: IF NOT EXISTS prevents re-application errors.

ALTER TABLE public.inspection_histories
  ADD COLUMN IF NOT EXISTS start_date  date,
  ADD COLUMN IF NOT EXISTS end_date    date,
  ADD COLUMN IF NOT EXISTS status      text CHECK (status IN ('active','expired','pending')),
  ADD COLUMN IF NOT EXISTS center      text,
  ADD COLUMN IF NOT EXISTS cost        numeric(15,0),
  ADD COLUMN IF NOT EXISTS notes       text,
  ADD COLUMN IF NOT EXISTS updated_at  timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.insurance_histories
  ADD COLUMN IF NOT EXISTS start_date    date,
  ADD COLUMN IF NOT EXISTS end_date      date,
  ADD COLUMN IF NOT EXISTS status        text CHECK (status IN ('active','expired','pending')),
  ADD COLUMN IF NOT EXISTS provider      text,
  ADD COLUMN IF NOT EXISTS policy_number text,
  ADD COLUMN IF NOT EXISTS cost          numeric(15,0),
  ADD COLUMN IF NOT EXISTS notes         text,
  ADD COLUMN IF NOT EXISTS updated_at    timestamptz NOT NULL DEFAULT now();
