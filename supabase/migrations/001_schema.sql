-- =============================================================================
-- Migration 001 — Full Schema
-- Idempotent: safe to run multiple times (uses IF NOT EXISTS / DO NOTHING).
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- USERS
-- Mirrors auth.users; holds the public profile synced after Google OAuth.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id          uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text,
  full_name   text,
  phone       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- CARS
-- A user can own multiple vehicles.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.cars (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  plate       text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cars_user_id_idx ON public.cars (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- ITEMS  (replaces categories)
-- Hierarchical item catalogue.
--   Root items  → parent_id IS NULL, user_id IS NULL  = system service types
--   Child items → parent_id set                       = specific service parts
--   User items  → user_id = auth.uid()                = custom items per user
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.items (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  parent_id   uuid        REFERENCES public.items(id) ON DELETE SET NULL,
  user_id     uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS items_parent_id_idx ON public.items (parent_id);
CREATE INDEX IF NOT EXISTS items_user_id_idx   ON public.items (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- SERVICES
-- A completed service record for a car.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.services (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id      uuid        NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  date        date,
  kilometer   numeric(15,0),
  cost        numeric(15,0),
  description text,                                        -- JSON meta blob
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS services_car_id_idx  ON public.services (car_id);
CREATE INDEX IF NOT EXISTS services_date_idx    ON public.services (date DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- SERVICE_ITEMS  (junction)
-- Records which specific items were replaced/serviced in a service visit.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.service_items (
  service_id  uuid        NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  item_id     uuid        NOT NULL REFERENCES public.items(id),
  PRIMARY KEY (service_id, item_id)
);

CREATE INDEX IF NOT EXISTS service_items_service_id_idx ON public.service_items (service_id);
CREATE INDEX IF NOT EXISTS service_items_item_id_idx    ON public.service_items (item_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- REMINDERS
-- A pending service reminder (not yet completed).
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reminders (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id      uuid        NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  category_id uuid,
  description text,                                        -- JSON meta blob
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS reminders_car_id_idx ON public.reminders (car_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- INSPECTION_HISTORIES
-- Tracks technical inspection validity periods for a car.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.inspection_histories (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id      uuid        NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  start_date  date,
  end_date    date,
  status      text        CHECK (status IN ('active','expired','pending')),
  center      text,                                        -- inspection station name
  cost        numeric(15,0),
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inspection_histories_car_id_idx ON public.inspection_histories (car_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- INSURANCE_HISTORIES
-- Tracks insurance policy validity periods for a car.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.insurance_histories (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id        uuid        NOT NULL REFERENCES public.cars(id) ON DELETE CASCADE,
  start_date    date,
  end_date      date,
  status        text        CHECK (status IN ('active','expired','pending')),
  provider      text,
  policy_number text,
  cost          numeric(15,0),
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS insurance_histories_car_id_idx ON public.insurance_histories (car_id);
