# Integration Flowcharts - Visual Reference

Complete visual flowcharts for all app flows with API integration details.

---

## 1. Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      PHONE NUMBER ENTRY SCREEN                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  User Input: Phone Number (Persian/English numerals accepted)       │
│       ↓                                                              │
│  normalizePhoneNumber("+989123456789")                              │
│       ↓                                                              │
│  [Send Code Button Pressed]                                         │
│       ↓                                                              │
│  ┌─────────────────────────────────────────────────┐               │
│  │ POST /auth/send-otp                             │               │
│  │ {                                                │               │
│  │   phoneNumber: "+989123456789",                 │               │
│  │   language: "fa"                                 │               │
│  │ }                                                │               │
│  └─────────────────────────────────────────────────┘               │
│       ↓                                                              │
│  Loading State: Disable button, show spinner                        │
│       ↓                                                              │
│  ┌─────────────────────┬──────────────────────────┐                │
│  │    SUCCESS          │         ERROR             │                │
│  │ {success: true}     │  {error: "Rate limit"}    │                │
│  └──────┬──────────────┴────────┬─────────────────┘                │
│         │                       │                                   │
│         ↓                       ↓                                   │
│  Show toast            Display error message                        │
│  Navigate to OTP       Keep on screen                               │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        OTP VERIFICATION SCREEN                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  User Input: 6-digit OTP code                                       │
│       ↓                                                              │
│  Auto-submit when 6 digits entered                                  │
│       ↓                                                              │
│  ┌─────────────────────────────────────────────────┐               │
│  │ POST /auth/verify-otp                           │               │
│  │ {                                                │               │
│  │   phoneNumber: "+989123456789",                 │               │
│  │   otpCode: "123456"                             │               │
│  │ }                                                │               │
│  └─────────────────────────────────────────────────┘               │
│       ↓                                                              │
│  Loading Overlay: Full screen spinner                               │
│       ↓                                                              │
│  ┌─────────────────────┬──────────────────────────┐                │
│  │    SUCCESS          │         ERROR             │                │
│  │ {                   │  {error: "Invalid OTP"}   │                │
│  │   accessToken,      │                           │                │
│  │   refreshToken,     │                           │                │
│  │   user: {...}       │                           │                │
│  │ }                   │                           │                │
│  └──────┬──────────────┴────────┬─────────────────┘                │
│         │                       │                                   │
│         ↓                       ↓                                   │
│  1. Store tokens       Show error message                           │
│  2. Update API client  Clear OTP input                              │
│  3. Store user data    Enable resend button                         │
│  4. Navigate to App                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Dashboard Load Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                          DASHBOARD SCREEN                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Trigger: Screen mount OR Pull to refresh                           │
│       ↓                                                              │
│  ┌─────────────────────────────────────────────────┐               │
│  │ GET /dashboard                                  │               │
│  │ Headers: Authorization: Bearer {token}         │               │
│  └─────────────────────────────────────────────────┘               │
│       ↓                                                              │
│  Loading State: Show skeleton cards                                 │
│       ↓                                                              │
│  ┌───────────────────────────────────────────────┐                 │
│  │            BACKEND PROCESSING                 │                 │
│  │  1. Verify JWT token                          │                 │
│  │  2. Extract user_id                           │                 │
│  │  3. Query cars (with RLS filter)              │                 │
│  │  4. For each car:                             │                 │
│  │     - Get last service date                   │                 │
│  │     - Count upcoming reminders                │                 │
│  │     - Get current insurance                   │                 │
│  │     - Get current inspection                  │                 │
│  │  5. Get upcoming reminders (top 5)            │                 │
│  │  6. Get recent services (last 10)             │                 │
│  │  7. Calculate alerts                          │                 │
│  │  8. Calculate stats                           │                 │
│  └───────────────────────────────────────────────┘                 │
│       ↓                                                              │
│  ┌─────────────────────┬──────────────────────────┐                │
│  │    SUCCESS          │         ERROR             │                │
│  │ 200 OK              │  401 Unauthorized         │                │
│  │ {                   │  500 Server Error         │                │
│  │   cars: [...],      │  Network Error            │                │
│  │   upcomingReminders,│                           │                │
│  │   recentServices,   │                           │                │
│  │   alerts,           │                           │                │
│  │   stats             │                           │                │
│  │ }                   │                           │                │
│  └──────┬──────────────┴────────┬─────────────────┘                │
│         │                       │                                   │
│         ↓                       ↓                                   │
│  ┌──────────────────┐   ┌──────────────────┐                      │
│  │ RENDER UI        │   │ ERROR HANDLING   │                      │
│  ├──────────────────┤   ├──────────────────┤                      │
│  │ Car Carousel     │   │ 401 → Logout     │                      │
│  │ - Brand/Model    │   │ 500 → Retry btn  │                      │
│  │ - Current mileage│   │ Network → Retry  │                      │
│  │ - Alerts badge   │   │                   │                      │
│  │                  │   └──────────────────┘                      │
│  │ Alerts Section   │                                               │
│  │ - Insurance exp  │                                               │
│  │ - Inspection exp │                                               │
│  │                  │                                               │
│  │ Upcoming Services│                                               │
│  │ - Card per reminder                                             │
│  │ - Days/KM until  │                                               │
│  │ - Category icon  │                                               │
│  │                  │                                               │
│  │ Service History  │                                               │
│  │ - Timeline view  │                                               │
│  │ - Date, cost     │                                               │
│  │                  │                                               │
│  │ Stats Grid       │                                               │
│  │ - Total cars     │                                               │
│  │ - Total services │                                               │
│  │ - Year cost      │                                               │
│  └──────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Add Service Complete Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        STEP 1: SELECT CAR                            │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐               │
│  │ GET /cars                                       │               │
│  └─────────────────────────────────────────────────┘               │
│       ↓                                                              │
│  Display car list with radio selection                              │
│       ↓                                                              │
│  User selects car → Navigate to Step 2                              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                   STEP 2: SERVICE DETAILS                            │
├─────────────────────────────────────────────────────────────────────┤
│  On Mount:                                                           │
│  ┌─────────────────────────────────────────────────┐               │
│  │ GET /service-categories?language=fa             │               │
│  └─────────────────────────────────────────────────┘               │
│       ↓                                                              │
│  Display category grid (engine, brake, oil, etc.)                   │
│       ↓                                                              │
│  User selects category (e.g., "Oil Change")                         │
│       ↓                                                              │
│  ┌─────────────────────────────────────────────────┐               │
│  │ GET /service-categories/:id/checklist           │               │
│  └─────────────────────────────────────────────────┘               │
│       ↓                                                              │
│  Display checklist items:                                           │
│  ☑ تعویض روغن موتور                                                │
│  ☑ تعویض فیلتر روغن                                                │
│  ☐ بررسی سطح روغن                                                  │
│  + افزودن مورد جدید                                                │
│       ↓                                                              │
│  User fills form:                                                    │
│  - Service date: [Date Picker] → "2024-01-10"                      │
│  - Mileage: [44500] → normalize to English number                  │
│  - Cost: [۲۵۰۰۰۰۰] → normalize to English number                    │
│  - Description: "تعویض روغن و فیلتر"                               │
│  - Service provider: "تعمیرگاه مهرگان"                              │
│       ↓                                                              │
│  Form Validation:                                                    │
│  ✓ Service date required                                            │
│  ✓ Category selected                                                │
│  ✓ At least one item checked (or custom item)                       │
│       ↓                                                              │
│  Continue to Step 3 (Reminder) OR Submit                            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│              STEP 3: ADD REMINDER (Optional)                         │
├─────────────────────────────────────────────────────────────────────┤
│  Toggle: "افزودن یادآوری برای سرویس بعدی"                          │
│       ↓                                                              │
│  If enabled:                                                         │
│  - Title: "تعویض روغن بعدی" (auto-filled)                          │
│  - Due date: [2024-06-10] (6 months later)                          │
│  - Due mileage: [49500] (current + 5000)                            │
│  - Notify 7 days before                                             │
│  - Notify 500 km before                                             │
│       ↓                                                              │
│  Validation:                                                         │
│  - At least one due condition (date OR mileage)                     │
│       ↓                                                              │
│  Tap "ثبت سرویس"                                                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      SUBMIT & API CALLS                              │
├─────────────────────────────────────────────────────────────────────┤
│  Loading Overlay: "در حال ثبت سرویس..."                            │
│       ↓                                                              │
│  ┌─────────────────────────────────────────────────┐               │
│  │ API CALL 1: Create Service                      │               │
│  │ POST /cars/:carId/services                      │               │
│  │ {                                                │               │
│  │   categoryId: "uuid",                           │               │
│  │   serviceDate: "2024-01-10",                    │               │
│  │   mileage: 44500,                               │               │
│  │   cost: 2500000,                                │               │
│  │   currency: "toman",                            │               │
│  │   items: [                                       │               │
│  │     { checklistItemId: "uuid", isChecked: true },              │
│  │     { customItemName: "تعویض واشر", isChecked: true }          │
│  │   ]                                              │               │
│  │ }                                                │               │
│  └─────────────────────────────────────────────────┘               │
│       ↓                                                              │
│  ┌───────────────────────────────────────────────┐                 │
│  │       BACKEND PROCESSING                      │                 │
│  │  1. Verify user owns car (RLS)                │                 │
│  │  2. Insert service record                     │                 │
│  │  3. Insert service items                      │                 │
│  │  4. Update car current_mileage                │                 │
│  │  5. Return created service                    │                 │
│  └───────────────────────────────────────────────┘                 │
│       ↓                                                              │
│  ✓ Service created: { id: "service-uuid", ... }                    │
│       ↓                                                              │
│  ┌─────────────────────────────────────────────────┐               │
│  │ API CALL 2: Create Reminder (if enabled)       │               │
│  │ POST /cars/:carId/reminders                     │               │
│  │ {                                                │               │
│  │   categoryId: "uuid",                           │               │
│  │   title: "تعویض روغن بعدی",                     │               │
│  │   dueDate: "2024-06-10",                        │               │
│  │   dueMileage: 49500,                            │               │
│  │   notifyDaysBefore: 7,                          │               │
│  │   notifyKmBefore: 500                           │               │
│  │ }                                                │               │
│  └─────────────────────────────────────────────────┘               │
│       ↓                                                              │
│  ✓ Reminder created (if enabled)                                   │
│       ↓                                                              │
│  ┌─────────────────────┬──────────────────────────┐                │
│  │    SUCCESS          │         ERROR             │                │
│  └──────┬──────────────┴────────┬─────────────────┘                │
│         │                       │                                   │
│         ↓                       ↓                                   │
│  Success Toast          Error Toast                                 │
│  "سرویس ثبت شد"        "خطا در ثبت"                                │
│         ↓                       ↓                                   │
│  Navigate to            Stay on screen                              │
│  ServiceDetails         Show error message                          │
│  OR Dashboard           Allow retry                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Service History with Filtering

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SERVICE HISTORY SCREEN                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Initial State:                                                      │
│  - selectedCarId: from dashboard OR first car                       │
│  - filters: { category: null, fromDate: null, toDate: null }       │
│  - pagination: { limit: 20, offset: 0, total: 0 }                  │
│       ↓                                                              │
│  ┌─────────────────────────────────────────────────┐               │
│  │ GET /cars/:carId/services?limit=20&offset=0     │               │
│  └─────────────────────────────────────────────────┘               │
│       ↓                                                              │
│  Loading: Skeleton cards (3-4 placeholders)                         │
│       ↓                                                              │
│  ┌─────────────────────┬──────────────────────────┐                │
│  │    SUCCESS          │         ERROR             │                │
│  │ {                   │                           │                │
│  │   services: [...],  │  Show error with retry   │                │
│  │   pagination: {     │                           │                │
│  │     total: 12,      │                           │                │
│  │     limit: 20,      │                           │                │
│  │     offset: 0       │                           │                │
│  │   }                 │                           │                │
│  │ }                   │                           │                │
│  └──────┬──────────────┴──────────────────────────┘                │
│         │                                                            │
│         ↓                                                            │
│  ┌──────────────────────────────────────────────┐                  │
│  │ RENDER SERVICE CARDS                         │                  │
│  ├──────────────────────────────────────────────┤                  │
│  │ Card 1 (Collapsed):                          │                  │
│  │  [Oil Icon] تعویض روغن    ۱۳ فروردین ۱۴۰۴  │                  │
│  │  کیلومتر: ۴۴۵۰۰  |  ۲،۵۰۰،۰۰۰ تومان        │                  │
│  │  [Tap to expand]                             │                  │
│  ├──────────────────────────────────────────────┤                  │
│  │ Card 2 (Expanded):                           │                  │
│  │  [Brake Icon] سرویس ترمز  ۵ اسفند ۱۴۰۳     │                  │
│  │  کیلومتر: ۴۲۰۰۰  |  ۳،۲۰۰،۰۰۰ تومان        │                  │
│  │                                               │                  │
│  │  موارد انجام شده:                            │                  │
│  │  ✓ تعویض لنت ترمز جلو                        │                  │
│  │  ✓ تعویض لنت ترمز عقب                        │                  │
│  │  ✓ بررسی روغن ترمز                           │                  │
│  │                                               │                  │
│  │  یادداشت: لنت‌های اورجینال استفاده شد        │                  │
│  │                                               │                  │
│  │  [Edit Button] [Delete Button]               │                  │
│  └──────────────────────────────────────────────┘                  │
│       ↓                                                              │
│  User scrolls to bottom                                             │
│       ↓                                                              │
│  onEndReached() → Load more if total > current count               │
│       ↓                                                              │
│  ┌─────────────────────────────────────────────────┐               │
│  │ GET /cars/:carId/services?limit=20&offset=20    │               │
│  └─────────────────────────────────────────────────┘               │
│       ↓                                                              │
│  Append to existing list                                            │
│  Show loading spinner at bottom                                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    FILTER APPLICATION                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  User taps "Filter" button                                          │
│       ↓                                                              │
│  Show filter modal:                                                  │
│  - Car selector (multi-car users)                                   │
│  - Category filter (Oil, Brake, Engine, etc.)                       │
│  - Date range (From - To)                                           │
│       ↓                                                              │
│  User selects filters:                                               │
│  - Category: "Oil"                                                   │
│  - From: "2024-01-01"                                               │
│  - To: "2024-12-31"                                                 │
│       ↓                                                              │
│  Tap "Apply"                                                         │
│       ↓                                                              │
│  ┌─────────────────────────────────────────────────────────┐       │
│  │ GET /cars/:carId/services?                              │       │
│  │   category=oil&fromDate=2024-01-01&toDate=2024-12-31   │       │
│  └─────────────────────────────────────────────────────────┘       │
│       ↓                                                              │
│  Reset pagination (offset = 0)                                      │
│  Show loading                                                        │
│  Display filtered results                                           │
│       ↓                                                              │
│  Empty State (if no matches):                                       │
│  "هیچ سرویسی با این فیلترها یافت نشد"                              │
│  [Clear Filters Button]                                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Delete Service Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                       DELETE SERVICE FLOW                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  User taps "Delete" button on service card                          │
│       ↓                                                              │
│  ┌──────────────────────────────────────────┐                      │
│  │     CONFIRMATION DIALOG                  │                      │
│  ├──────────────────────────────────────────┤                      │
│  │  ⚠️ حذف سرویس                           │                      │
│  │                                           │                      │
│  │  آیا مطمئن هستید؟                        │                      │
│  │  این عملیات قابل بازگشت نیست.           │                      │
│  │                                           │                      │
│  │  [انصراف]        [حذف (Red)]            │                      │
│  └──────────────────────────────────────────┘                      │
│       ↓                    ↓                                        │
│    Cancel             Confirm                                       │
│    (Nothing)              ↓                                         │
│                  ┌────────────────────┐                            │
│                  │ OPTIMISTIC UPDATE  │                            │
│                  │ Remove from UI     │                            │
│                  └────────────────────┘                            │
│                           ↓                                         │
│                  ┌─────────────────────────────────────────┐       │
│                  │ DELETE /cars/:carId/services/:serviceId │       │
│                  └─────────────────────────────────────────┘       │
│                           ↓                                         │
│              ┌─────────────────┬─────────────────────┐            │
│              │    SUCCESS      │       ERROR          │            │
│              └────────┬────────┴───────┬─────────────┘            │
│                       │                │                            │
│                       ↓                ↓                            │
│              Success Toast    Revert UI change                     │
│              "سرویس حذف شد"   Reload services                      │
│                               Error Toast                          │
│                               "خطا در حذف"                         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Reminder Complete Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                   UPCOMING SERVICES SCREEN                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────────────────────────────────────┐               │
│  │ Swipeable Reminder Card                         │               │
│  ├─────────────────────────────────────────────────┤               │
│  │                                                  │               │
│  │ ← Swipe Left = Done (Green)                     │               │
│  │                                                  │               │
│  │  [Oil Icon] تعویض روغن موتور                   │               │
│  │  تاریخ: ۱۵ بهمن (۱۵ روز دیگر)                  │               │
│  │  کیلومتر: ۵۰۰۰۰ (۵۰۰۰ کیلومتر دیگر)             │               │
│  │                                                  │               │
│  │ → Swipe Right = Delete (Red)                    │               │
│  │                                                  │               │
│  └─────────────────────────────────────────────────┘               │
│       ↓                         ↓                                   │
│  Swipe Left                Swipe Right                              │
│  (Complete)                (Delete)                                 │
│       ↓                         ↓                                   │
│  ┌────────────────┐    ┌──────────────┐                           │
│  │ CONFIRM DIALOG │    │ CONFIRM      │                           │
│  │ "انجام شد؟"   │    │ "حذف شود؟"  │                           │
│  └────────┬───────┘    └──────┬───────┘                           │
│           ↓                    ↓                                   │
│     ┌──────────────┐    ┌──────────────┐                         │
│     │ POST /cars/  │    │ DELETE       │                         │
│     │ :id/reminders│    │ /cars/:id/   │                         │
│     │ /:id/complete│    │ reminders/:id│                         │
│     └──────┬───────┘    └──────┬───────┘                         │
│            │                    │                                   │
│            ↓                    ↓                                   │
│     Optimistic remove   Optimistic remove                          │
│     from list          from list                                   │
│            │                    │                                   │
│            ↓                    ↓                                   │
│     ┌──────────────┐    ┌──────────────┐                         │
│     │  SUCCESS     │    │  SUCCESS     │                         │
│     │  Toast       │    │  Toast       │                         │
│     │  "تکمیل شد"  │    │  "حذف شد"    │                         │
│     └──────────────┘    └──────────────┘                         │
│                                                                      │
│     On ERROR: Reload list & show error                             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                      ERROR HANDLING STRATEGY                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  API Call Made                                                       │
│       ↓                                                              │
│  ┌────────────────────────────────────────────┐                    │
│  │         AXIOS INTERCEPTOR                  │                    │
│  └────────────────────────────────────────────┘                    │
│       ↓                                                              │
│  Check Response                                                      │
│       ↓                                                              │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐         │
│  │   401    │   400    │   404    │   500    │ Network  │         │
│  │Unauthorized Validation Not Found Server   │  Error   │         │
│  └────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬─────┘         │
│       │          │          │          │          │                │
│       ↓          ↓          ↓          ↓          ↓                │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │
│  │ Try    │ │ Show   │ │ Show   │ │ Retry  │ │ Queue  │          │
│  │ Refresh│ │ Field  │ │ Error  │ │ with   │ │ Offline│          │
│  │ Token  │ │ Errors │ │ Message│ │ Backoff│ │ (if    │          │
│  └────┬───┘ └────────┘ └────────┘ └────┬───┘ │ write) │          │
│       │                                  │     └────────┘          │
│       ↓                                  ↓                          │
│  ┌────────────────┐              ┌────────────────┐               │
│  │ Refresh Success│              │ Retry Attempts │               │
│  │ → Retry API    │              │ 1: Wait 1s     │               │
│  │                │              │ 2: Wait 2s     │               │
│  │ Refresh Failed │              │ 3: Wait 4s     │               │
│  │ → Logout       │              │ → Give up      │               │
│  └────────────────┘              └────────────────┘               │
│                                                                      │
│  ┌────────────────────────────────────────────────┐                │
│  │         ERROR UI COMPONENTS                    │                │
│  ├────────────────────────────────────────────────┤                │
│  │ Network Error:                                 │                │
│  │  "خطا در اتصال به اینترنت"                    │                │
│  │  [تلاش مجدد]                                   │                │
│  │                                                 │                │
│  │ Server Error:                                  │                │
│  │  "خطای سرور. لطفا بعدا تلاش کنید"             │                │
│  │  [تلاش مجدد]                                   │                │
│  │                                                 │                │
│  │ Validation Error:                              │                │
│  │  Show field-specific errors:                   │                │
│  │  - "تاریخ سرویس الزامی است"                   │                │
│  │  - "شماره تلفن نامعتبر است"                   │                │
│  │                                                 │                │
│  │ Auth Error:                                    │                │
│  │  "نشست شما منقضی شده"                         │                │
│  │  → Auto logout & redirect to login            │                │
│  └────────────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. State Management Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GLOBAL STATE STRUCTURE                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────────────────────┐                  │
│  │            AuthContext                       │                  │
│  ├──────────────────────────────────────────────┤                  │
│  │  isAuthenticated: boolean                    │                  │
│  │  user: { id, phone }                         │                  │
│  │  accessToken: string                         │                  │
│  │  login(phone, otp) → API call                │                  │
│  │  logout() → Clear storage                    │                  │
│  └──────────────────────────────────────────────┘                  │
│                      ↓                                               │
│  ┌──────────────────────────────────────────────┐                  │
│  │          ProfileContext                      │                  │
│  ├──────────────────────────────────────────────┤                  │
│  │  profile: UserProfile                        │                  │
│  │  language: 'fa' | 'en'                       │                  │
│  │  theme: 'light' | 'dark'                     │                  │
│  │  updateProfile(updates) → API call           │                  │
│  │  changeLanguage(lang) → i18n + API           │                  │
│  └──────────────────────────────────────────────┘                  │
│                      ↓                                               │
│  ┌──────────────────────────────────────────────┐                  │
│  │           CarsContext                        │                  │
│  ├──────────────────────────────────────────────┤                  │
│  │  cars: Car[]                                 │                  │
│  │  selectedCarId: string                       │                  │
│  │  loading: boolean                            │                  │
│  │  fetchCars() → API call                      │                  │
│  │  selectCar(id) → Update state                │                  │
│  │  addCar(data) → API call + refetch           │                  │
│  │  updateCar(id, data) → API + update local    │                  │
│  │  deleteCar(id) → API + remove local          │                  │
│  └──────────────────────────────────────────────┘                  │
│                      ↓                                               │
│  ┌──────────────────────────────────────────────┐                  │
│  │        CategoriesContext (Cached)            │                  │
│  ├──────────────────────────────────────────────┤                  │
│  │  categories: ServiceCategory[]               │                  │
│  │  checklistItems: Map<categoryId, items[]>    │                  │
│  │  lastFetched: timestamp                      │                  │
│  │  fetchCategories() → API (cache 24h)         │                  │
│  │  getChecklistItems(categoryId) → API/cache   │                  │
│  └──────────────────────────────────────────────┘                  │
│                                                                       │
│  ┌──────────────────────────────────────────────┐                  │
│  │         CACHE INVALIDATION                   │                  │
│  ├──────────────────────────────────────────────┤                  │
│  │  On Service Create:                          │                  │
│  │  → Invalidate dashboard cache                │                  │
│  │  → Invalidate service history for car        │                  │
│  │                                               │                  │
│  │  On Reminder Complete/Delete:                │                  │
│  │  → Invalidate dashboard cache                │                  │
│  │  → Invalidate reminders list                 │                  │
│  │                                               │                  │
│  │  On Car Update:                              │                  │
│  │  → Invalidate dashboard cache                │                  │
│  │  → Update cars list locally                  │                  │
│  └──────────────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. Offline Support Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    OFFLINE OPERATION QUEUE                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  User performs write operation while offline                        │
│       ↓                                                              │
│  ┌────────────────────────────────────────────┐                    │
│  │  Network State: Offline                    │                    │
│  └────────────────────────────────────────────┘                    │
│       ↓                                                              │
│  Instead of API call:                                               │
│  1. Show optimistic UI update                                       │
│  2. Add operation to queue                                          │
│  3. Save queue to AsyncStorage                                      │
│       ↓                                                              │
│  ┌────────────────────────────────────────────────────┐            │
│  │  OFFLINE QUEUE                                     │            │
│  │  [                                                  │            │
│  │    {                                                │            │
│  │      id: "op-1",                                   │            │
│  │      type: "create",                               │            │
│  │      endpoint: "/cars/:id/services",               │            │
│  │      method: "POST",                               │            │
│  │      payload: { ... },                             │            │
│  │      timestamp: 1234567890                         │            │
│  │    },                                               │            │
│  │    { ... more operations ... }                     │            │
│  │  ]                                                  │            │
│  └────────────────────────────────────────────────────┘            │
│       ↓                                                              │
│  Show "Offline" badge in UI                                         │
│  Display queued operations count                                    │
│       ↓                                                              │
│  ┌────────────────────────────────────────────┐                    │
│  │  Network State Change: Online              │                    │
│  └────────────────────────────────────────────┘                    │
│       ↓                                                              │
│  Process Offline Queue:                                             │
│  1. For each operation in queue:                                    │
│     a. Execute API call                                             │
│     b. On success: Remove from queue                                │
│     c. On error: Keep in queue, log error                           │
│  2. Update AsyncStorage                                             │
│  3. Show success/failure notifications                              │
│  4. Refresh affected screens                                        │
│       ↓                                                              │
│  Hide "Offline" badge                                               │
│  Show "Synced" confirmation                                         │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Summary: Integration Checklist

✅ **Authentication**
- [ ] Phone number normalization (Persian/Arabic → English)
- [ ] OTP auto-submit on 6 digits
- [ ] Token storage in SecureStore
- [ ] Auto token refresh on 401

✅ **API Client**
- [ ] Axios instance with base URL
- [ ] Request interceptor (add auth header)
- [ ] Response interceptor (handle 401)
- [ ] Retry logic with exponential backoff
- [ ] Request/response logging in dev mode

✅ **State Management**
- [ ] AuthContext with login/logout
- [ ] ProfileContext with language/theme
- [ ] CarsContext with CRUD operations
- [ ] Cache strategy for categories

✅ **UI States**
- [ ] Loading states (skeleton, spinner, overlay)
- [ ] Empty states with action buttons
- [ ] Error states with retry buttons
- [ ] Success confirmations (toast, modal)

✅ **Data Formatting**
- [ ] Persian number conversion (display)
- [ ] English number normalization (input)
- [ ] Jalali date formatting
- [ ] Price formatting with currency
- [ ] Mileage formatting

✅ **Error Handling**
- [ ] Network error detection
- [ ] Validation error display
- [ ] Server error retry
- [ ] Auth error logout
- [ ] User-friendly error messages (Persian)

✅ **Offline Support**
- [ ] Network state monitoring
- [ ] Operation queue for writes
- [ ] AsyncStorage persistence
- [ ] Auto-sync when online
- [ ] Offline indicator in UI

✅ **Performance**
- [ ] Pull-to-refresh on lists
- [ ] Infinite scroll pagination
- [ ] Optimistic updates
- [ ] Cache invalidation
- [ ] Image lazy loading

This complete integration map provides everything your development team needs to implement the frontend-backend connection! 🚀
