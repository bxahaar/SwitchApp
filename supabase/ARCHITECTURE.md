# System Architecture Overview

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Mobile App Layer                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐│
│  │ Dashboard  │  │ Add Service│  │  Car Mgmt  │  │  Insights  ││
│  │   Screen   │  │   Screen   │  │   Screen   │  │   Screen   ││
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘│
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              API Client (Axios / Fetch)                   │  │
│  │   - Authentication Interceptor                            │  │
│  │   - Error Handling                                        │  │
│  │   - Request/Response Transformation                       │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                       Supabase Platform                          │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            Authentication Service                        │   │
│  │  - Phone/OTP Authentication                              │   │
│  │  - JWT Token Generation                                  │   │
│  │  - Session Management                                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            Edge Functions (Deno Runtime)                 │   │
│  │                                                           │   │
│  │  /make-server-cd2dec47/*                                 │   │
│  │  ├── /health                                             │   │
│  │  ├── /auth/send-otp                                      │   │
│  │  ├── /auth/verify-otp                                    │   │
│  │  ├── /profile                                            │   │
│  │  ├── /cars                                               │   │
│  │  ├── /cars/:id/services                                  │   │
│  │  ├── /cars/:id/reminders                                 │   │
│  │  ├── /cars/:id/insurance                                 │   │
│  │  ├── /cars/:id/inspections                              │   │
│  │  ├── /service-categories                                 │   │
│  │  ├── /insights                                           │   │
│  │  ├── /notifications                                      │   │
│  │  └── /dashboard                                          │   │
│  │                                                           │   │
│  │  Services:                                               │   │
│  │  - services.tsx (Service CRUD)                           │   │
│  │  - reminders.tsx (Reminder Management)                   │   │
│  │  - insurance_inspection.tsx (Insurance/Inspection)       │   │
│  │  - notifications.tsx (Notification Management)           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              ↓                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │        PostgreSQL Database (with RLS)                    │   │
│  │                                                           │   │
│  │  Core Tables:                                            │   │
│  │  ├── auth.users (managed by Supabase)                   │   │
│  │  ├── user_profiles                                       │   │
│  │  ├── cars                                                │   │
│  │  ├── services                                            │   │
│  │  ├── service_items                                       │   │
│  │  ├── reminders                                           │   │
│  │  ├── insurance_records                                   │   │
│  │  ├── technical_inspection_records                        │   │
│  │  ├── notifications                                       │   │
│  │                                                           │   │
│  │  Reference Tables:                                       │   │
│  │  ├── service_categories                                  │   │
│  │  ├── service_checklist_items                            │   │
│  │  ├── blog_posts                                          │   │
│  │                                                           │   │
│  │  Security:                                               │   │
│  │  - Row Level Security (RLS) enabled                      │   │
│  │  - User can only access their own data                   │   │
│  │  - Indexes on all foreign keys                           │   │
│  │  - Triggers for auto-update timestamps                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            Storage (Future Enhancement)                  │   │
│  │  - Service documents                                     │   │
│  │  - Insurance PDFs                                        │   │
│  │  - Technical inspection certificates                     │   │
│  │  - Blog post images                                      │   ���
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            Realtime (Future Enhancement)                 │   │
│  │  - Real-time notifications                               │   │
│  │  - Live updates for reminders                            │   │
│  │  - Multi-device sync                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    External Services                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Twilio    │  │   Firebase   │  │    Sentry    │          │
│  │  (SMS/OTP)   │  │    (Push)    │  │   (Errors)   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Authentication Flow

```
┌─────────┐                                                    ┌─────────┐
│ Mobile  │                                                    │Supabase │
│   App   │                                                    │  Auth   │
└────┬────┘                                                    └────┬────┘
     │                                                              │
     │  1. POST /auth/send-otp                                     │
     │     { phoneNumber: "+989123456789" }                        │
     ├─────────────────────────────────────────────────────────────>
     │                                                              │
     │                                            2. Generate OTP   │
     │                                               & Send SMS     │
     │                                                              │
     │  3. Response: { success: true }                             │
     <─────────────────────────────────────────────────────────────┤
     │                                                              │
     │  4. User enters OTP code                                    │
     │                                                              │
     │  5. POST /auth/verify-otp                                   │
     │     { phoneNumber: "+989123456789", otpCode: "123456" }    │
     ├─────────────────────────────────────────────────────────────>
     │                                                              │
     │                                            6. Verify OTP     │
     │                                               Generate JWT   │
     │                                                              │
     │  7. Response: { accessToken: "...", user: {...} }          │
     <─────────────────────────────────────────────────────────────┤
     │                                                              │
     │  8. Store token in secure storage                           │
     │                                                              │
     │  9. All subsequent requests include:                        │
     │     Authorization: Bearer <accessToken>                     │
     │                                                              │
```

### 2. Service Creation Flow

```
┌─────────┐                 ┌─────────┐                 ┌─────────┐
│ Mobile  │                 │  Edge   │                 │Database │
│   App   │                 │Function │                 │  (RLS)  │
└────┬────┘                 └────┬────┘                 └────┬────┘
     │                           │                           │
     │  1. POST /cars/:id/services                          │
     │     { serviceDate, cost,  │                          │
     │       items: [...] }      │                          │
     ├───────────────────────────>                          │
     │                           │                          │
     │                           │  2. Verify user owns car │
     │                           ├─────────────────────────>│
     │                           │                          │
     │                           │  3. Car verified         │
     │                           <─────────────────────────┤
     │                           │                          │
     │                           │  4. INSERT INTO services │
     │                           ├─────────────────────────>│
     │                           │                          │
     │                           │  5. Service created      │
     │                           <─────────────────────────┤
     │                           │                          │
     │                           │  6. INSERT service_items │
     │                           ├─────────────────────────>│
     │                           │                          │
     │                           │  7. Items created        │
     │                           <─────────────────────────┤
     │                           │                          │
     │                           │  8. UPDATE car mileage   │
     │                           ├─────────────────────────>│
     │                           │                          │
     │  9. Response: { service } │                          │
     <───────────────────────────┤                          │
     │                           │                          │
     │  10. Update local state   │                          │
     │      & show success       │                          │
     │                           │                          │
```

### 3. Dashboard Data Flow

```
┌─────────┐                 ┌─────────┐                 ┌─────────┐
│Dashboard│                 │  Edge   │                 │Database │
│ Screen  │                 │Function │                 │  (RLS)  │
└────┬────┘                 └────┬────┘                 └────┬────┘
     │                           │                           │
     │  1. GET /dashboard        │                           │
     ├───────────────────────────>                           │
     │                           │                           │
     │                           │  2. SELECT cars WHERE     │
     │                           │     user_id = :userId     │
     │                           ├──────────────────────────>│
     │                           │                           │
     │                           │  3. Cars data             │
     │                           <──────────────────────────┤
     │                           │                           │
     │                           │  4. For each car:         │
     │                           │     - Get last service    │
     │                           │     - Get reminders count │
     │                           │     - Get insurance       │
     │                           │     - Get inspection      │
     │                           ├──────────────────────────>│
     │                           │                           │
     │                           │  5. Aggregated data       │
     │                           <──────────────────────────┤
     │                           │                           │
     │                           │  6. SELECT upcoming       │
     │                           │     reminders (top 5)     │
     │                           ├──────────────────────────>│
     │                           │                           │
     │                           │  7. Reminders data        │
     │                           <──────────────────────────┤
     │                           │                           │
     │                           │  8. SELECT recent         │
     │                           │     services (last 10)    │
     │                           ├──────────────────────────>│
     │                           │                           │
     │                           │  9. Services data         │
     │                           <──────────────────────────┤
     │                           │                           │
     │                           │  10. Calculate alerts     │
     │                           │      (expiring docs)      │
     │                           │                           │
     │  11. Response: {          │                           │
     │      cars: [...],         │                           │
     │      reminders: [...],    │                           │
     │      recentServices: [...],                           │
     │      alerts: [...],       │                           │
     │      stats: {...}         │                           │
     │    }                      │                           │
     <───────────────────────────┤                           │
     │                           │                           │
     │  12. Render UI with data  │                           │
     │                           │                           │
```

---

## Security Architecture

### Row Level Security (RLS) Policy Structure

```
┌───────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                 RLS Policy Layer                         │  │
│  │                                                           │  │
│  │  user_profiles:                                          │  │
│  │    SELECT: WHERE auth.uid() = id                         │  │
│  │    UPDATE: WHERE auth.uid() = id                         │  │
│  │                                                           │  │
│  │  cars:                                                    │  │
│  │    SELECT: WHERE auth.uid() = user_id                    │  │
│  │    INSERT: WITH CHECK (auth.uid() = user_id)            │  │
│  │    UPDATE: WHERE auth.uid() = user_id                    │  │
│  │    DELETE: WHERE auth.uid() = user_id                    │  │
│  │                                                           │  │
│  │  services:                                                │  │
│  │    SELECT: WHERE auth.uid() = user_id                    │  │
│  │    INSERT: WITH CHECK (auth.uid() = user_id)            │  │
│  │    UPDATE: WHERE auth.uid() = user_id                    │  │
│  │    DELETE: WHERE auth.uid() = user_id                    │  │
│  │                                                           │  │
│  │  service_items:                                           │  │
│  │    SELECT: WHERE service.user_id = auth.uid()           │  │
│  │    INSERT: WITH CHECK (service.user_id = auth.uid())    │  │
│  │    UPDATE: WHERE service.user_id = auth.uid()           │  │
│  │    DELETE: WHERE service.user_id = auth.uid()           │  │
│  │                                                           │  │
│  │  ... (similar policies for other tables)                 │  │
│  └─────────────────────────────────────────────────────────┘  │
│                              ↑                                 │
│                    auth.uid() from JWT                         │
└───────────────────────────────────────────────────────────────┘
```

### Request Authorization Flow

```
Request with JWT Token
        ↓
┌───────────────────────┐
│   Extract JWT Token   │
│   from Authorization  │
│        Header         │
└───────┬───────────────┘
        ↓
┌───────────────────────┐
│   Verify JWT with     │
│   Supabase Auth       │
└───────┬───────────────┘
        ↓
┌───────────────────────┐
│   Extract user_id     │
│   from JWT payload    │
└───────┬───────────────┘
        ↓
┌───────────────────────┐
│   Set auth.uid()      │
│   context variable    │
└───────┬───────────────┘
        ↓
┌───────────────────────┐
│   Execute SQL query   │
│   with RLS policies   │
│   (auto-filtered)     │
└───────────────────────┘
```

---

## Scalability Strategy

### Database Optimization

```
┌─────────────────────────────────────────────────────────────┐
│                    Query Optimization                        │
│                                                               │
│  1. Indexes on:                                              │
│     - Foreign keys (car_id, user_id, category_id, etc.)     │
│     - Date fields (service_date, due_date, etc.)            │
│     - Status fields (is_active, is_current, status)         │
│                                                               │
│  2. Denormalization:                                         │
│     - user_id stored in child tables for RLS                │
│     - Avoids JOINs for permission checks                    │
│                                                               │
│  3. Pagination:                                              │
│     - All list endpoints use LIMIT/OFFSET                   │
│     - Default: 20-50 items per page                         │
│     - Max: 100 items per request                            │
│                                                               │
│  4. Selective Loading:                                       │
│     - Only fetch necessary columns                          │
│     - Lazy load related data (e.g., service items)          │
│                                                               │
│  5. Caching Strategy:                                        │
│     - Service categories (rarely change)                    │
│     - Checklist items (rarely change)                       │
│     - Blog posts (admin-updated)                            │
└─────────────────────────────────────────────────────────────┘
```

### Horizontal Scaling

```
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Auto-Scaling                     │
│                                                               │
│  Edge Functions:                                             │
│  - Auto-scale based on request volume                        │
│  - Concurrent execution (Deno isolates)                      │
│  - Global CDN distribution                                   │
│                                                               │
│  Database:                                                    │
│  - Connection pooling (PgBouncer)                           │
│  - Read replicas (Pro plan)                                  │
│  - Automatic backups                                         │
│                                                               │
│  Storage:                                                     │
│  - CDN-backed (automatic global distribution)               │
│  - Infinite scaling                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Future Enhancements

### Phase 2: Push Notifications

```
┌─────────┐                 ┌─────────┐                 ┌─────────┐
│  Cron   │                 │  Edge   │                 │Firebase │
│  Job    │                 │Function │                 │   FCM   │
└────┬────┘                 └────┬────┘                 └────┬────┘
     │                           │                           │
     │  1. Check reminders       │                           │
     │     due in 7 days         │                           │
     ├───────────────────────────>                           │
     │                           │                           │
     │                           │  2. For each reminder:    │
     │                           │     - Create notification │
     │                           │     - Get FCM token       │
     │                           │                           │
     │                           │  3. Send push via FCM     │
     │                           ├──────────────────────────>│
     │                           │                           │
     │                           │  4. Notification sent     │
     │                           <──────────────────────────┤
     │                           │                           │
     │                           │  5. Update                │
     │                           │     last_notification_sent│
     │                           │                           │
```

### Phase 3: Real-time Sync

```
┌─────────┐                 ┌─────────┐                 ┌─────────┐
│ Device  │                 │Supabase │                 │ Device  │
│    A    │                 │Realtime │                 │    B    │
└────┬────┘                 └────┬────┘                 └────┬────┘
     │                           │                           │
     │  1. Subscribe to          │                           │
     │     cars channel          │                           │
     ├───────────────────────────>                           │
     │                           │  2. Subscribe to          │
     │                           │     cars channel          │
     │                           <───────────────────────────┤
     │                           │                           │
     │  3. UPDATE car            │                           │
     ├───────────────────────────>                           │
     │                           │                           │
     │                           │  4. Broadcast UPDATE      │
     │                           ├──────────────────────────>│
     │                           │                           │
     │                           │  5. Update local state    │
     │                           │                           │
```

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React Native | Mobile app (Android/iOS) |
| **UI Framework** | React + Tailwind | Component library |
| **State Management** | React Context / Zustand | Local state & caching |
| **API Client** | Axios | HTTP requests |
| **Backend** | Supabase Edge Functions | RESTful API server |
| **Runtime** | Deno | Serverless execution |
| **Web Framework** | Hono | Routing & middleware |
| **Database** | PostgreSQL | Relational data storage |
| **Authentication** | Supabase Auth | Phone/OTP authentication |
| **Storage** | Supabase Storage | File uploads (future) |
| **Real-time** | Supabase Realtime | WebSocket sync (future) |
| **SMS** | Twilio / MessageBird | OTP delivery |
| **Push Notifications** | Firebase FCM | Mobile push (future) |
| **Error Tracking** | Sentry | Error monitoring (optional) |
| **Analytics** | Supabase Analytics | Usage metrics |

---

## Performance Characteristics

| Metric | Target | Notes |
|--------|--------|-------|
| **API Response Time** | < 200ms | 95th percentile |
| **Database Query Time** | < 50ms | With proper indexes |
| **Authentication** | < 500ms | OTP verification |
| **Dashboard Load** | < 1s | Including all data |
| **Service Create** | < 300ms | Including items |
| **Concurrent Users** | 1000+ | Supabase free tier |
| **Requests/minute** | 100 per user | Rate limiting |
| **Database Size** | 500 MB+ | Free tier |
| **Storage** | 1 GB+ | Free tier |

---

## Disaster Recovery

### Backup Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backups                          │
│                                                               │
│  Automatic Backups (Pro Plan):                              │
│  ├── Daily backups (retained for 7 days)                    │
│  ├── Weekly backups (retained for 4 weeks)                  │
│  └── Monthly backups (retained for 3 months)                │
│                                                               │
│  Point-in-Time Recovery:                                     │
│  └── Restore to any point in last 7 days                    │
│                                                               │
│  Manual Exports:                                             │
│  ├── SQL dumps via Supabase dashboard                       │
│  └── CSV exports for critical tables                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Conclusion

This architecture provides:
- ✅ **Scalability**: Handles 1000+ concurrent users
- ✅ **Security**: RLS ensures data isolation
- ✅ **Performance**: Optimized queries with indexes
- ✅ **Reliability**: Auto-backups & disaster recovery
- ✅ **Extensibility**: Easy to add new features
- ✅ **Maintainability**: Clear separation of concerns
- ✅ **Cost-effective**: Free tier for initial launch

The system is production-ready and can scale from MVP to thousands of users without major architectural changes.
