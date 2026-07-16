# Supabase Migration & Architecture Cleanup — Report

## Phase 1 — Runtime Audit (findings)

Runtime path: `App.tsx` → `ThemeProvider` → `AppProvider` → `AuthProvider` → `AppContent`,
which renders `SplashScreen` → `PhoneLogin` (Google OAuth) → tabbed UI
(`Dashboard`, `AddService`, `CarManagement`, `EducationInsights`).

- **Context providers (active):** `AppContext`, `AuthContext`. (Other `createContext`
  usages live inside unused `components/ui/*` primitives — not in the runtime tree.)
- **Mock / demo data found:** none persisted. The only hardcoded arrays are
  `EducationInsights.insightCards` (static educational content — legitimately static,
  not entity data) and the now-deleted `TimelineVariantsDemo` sample data.
- **localStorage / sessionStorage:** none in the codebase.
- **React state pretending to be DB state:** the dead `carExtras` variable in
  `AppContext` (declared, never used) plus session-held insurance/inspection dates
  (see limitation below).
- **Dead / unreachable files:** `OTPVerification.tsx`, `TimelineVariantsDemo.tsx`,
  `imports/CarServiceManagementApp.tsx`, `imports/svg-v27kjalui.ts`.
- **Duplicate feature implementations:** legacy phone/OTP auth (`OTPVerification`)
  superseded by Google OAuth in `PhoneLogin` + `AuthContext`. Removed.

### Verified DB schema (probed live via anon client)
- `cars` → `id, user_id, name, plate, created_at`
- `services` → `id, car_id, category_id, date, cost, description, created_at`
- `reminders` → `id, car_id, category_id, description, created_at`
- `categories` → `id, name, parent_id, user_id, created_at` — **currently 0 rows**
- `users` → includes `id, email, full_name, phone`
- `insurance` / `inspections` → **do not exist** (checked all name variants)

## Phase 2 — Architecture Cleanup

Single implementation per feature. All direct `supabase.from(...)` calls now live
**only** in the service layer; contexts orchestrate state, components stay presentational.

## Phase 3 — Supabase Migration

All entity reads/inserts/updates/deletes go through Supabase, and every mutation
reloads fresh data from Supabase (no local array is treated as the source of truth).

---

## Deleted files
- `src/app/components/OTPVerification.tsx` (legacy phone/OTP auth)
- `src/app/components/TimelineVariantsDemo.tsx` (demo/sample data)
- `src/imports/CarServiceManagementApp.tsx` (old Figma import)
- `src/imports/svg-v27kjalui.ts` (orphaned SVG asset)

## New files (reusable Supabase service layer)
- `src/lib/services/types.ts` — domain types (`Car`, `Service`, `Reminder`, `UserProfile`)
- `src/lib/services/categories.ts` — service-type ↔ category UUID mapping
- `src/lib/services/cars.ts` — `carsService` (list/create/update/remove)
- `src/lib/services/services.ts` — `servicesService` (listByCars/create/update/remove)
- `src/lib/services/reminders.ts` — `remindersService` (listByCars/create/remove)
- `src/lib/services/users.ts` — `usersService.syncProfile`
- `src/lib/services/index.ts` — barrel export
- `supabase/rls_services.sql`, `supabase/rls_reminders.sql` — RLS policies

## Modified files
- `src/app/context/AppContext.tsx` — delegates all CRUD to the service layer;
  removed dead `carExtras` state; kept domain-type re-exports for components.
- `src/app/context/AuthContext.tsx` — profile upsert moved to `usersService.syncProfile`.
- `src/app/components/Dashboard.tsx` — async deletes with error toasts.

## Runtime paths that changed
- Data access `component → context → supabase` became
  `component → context → service → supabase`.
- User profile sync `AuthContext → supabase.from('users')` became
  `AuthContext → usersService → supabase`.

## Supabase integrations (single source of truth)
- Auth: `signInWithOAuth` (Google), `getSession`, `onAuthStateChange`, `signOut`.
- Data: cars / services / reminders full CRUD + users profile upsert.

---

## Known limitation — insurance & inspection dates
There is **no `insurance`/`inspections` table and no column on `cars`** to store these,
and this environment cannot run schema migrations/DDL. These dates therefore remain
in-memory (session-only) and are the single group of fields not persisted to Supabase.
To persist them, add columns to `cars` (or create tables) in the Supabase dashboard;
the code is structured (`carsService` + `AppContext.updateCar`) to make wiring them in
a one-place change once a column exists.

## Required manual steps in the Supabase dashboard
1. Run `supabase/seed_categories.sql` — **`categories` is empty**, so service/reminder
   inserts will fail the `category_id` foreign key until it is seeded.
2. Run `supabase/rls_users.sql`, `rls_cars.sql`, `rls_services.sql`, `rls_reminders.sql`.
3. Set Auth **SITE_URL** to `https://switchapp-production.up.railway.app` and add it to
   the Redirect URLs allowlist.
