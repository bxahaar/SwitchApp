# Frontend-Backend Integration Map

Complete API integration guide for the Car Service Management mobile application.

---

## Table of Contents

1. [Authentication Flow](#1-authentication-flow)
2. [Dashboard Screen](#2-dashboard-screen)
3. [Add Service Flow](#3-add-service-flow)
4. [Upcoming Services Screen](#4-upcoming-services-screen)
5. [Service History Screen](#5-service-history-screen)
6. [Car Management](#6-car-management)
7. [Insurance & Technical Inspection](#7-insurance--technical-inspection)
8. [Insights / Blog](#8-insights--blog)
9. [Settings Screen](#9-settings-screen)
10. [Global State Management](#10-global-state-management)
11. [Error Handling & Retry Logic](#11-error-handling--retry-logic)

---

## 1. Authentication Flow

### 1.1 Phone Number Entry Screen

**Screen Name:** `PhoneNumberScreen` / `LoginScreen`

#### API Call: Send OTP

**When:** User enters phone number and taps "Send Code" button

**Endpoint:** `POST /auth/send-otp`

**Request Payload:**
```typescript
{
  phoneNumber: string;  // e.g., "+989123456789"
  language: "fa" | "en"; // Current app language
}
```

**Code Example:**
```typescript
const sendOTP = async (phoneNumber: string) => {
  setLoading(true);
  setError(null);
  
  try {
    const response = await apiClient.post('/auth/send-otp', {
      phoneNumber: normalizePhoneNumber(phoneNumber), // +98...
      language: i18n.language,
    });
    
    // Success - navigate to OTP screen
    navigation.navigate('OTPVerification', { phoneNumber });
    
    // Show success message
    showToast(response.data.message); // "کد تایید ارسال شد"
  } catch (error) {
    setError(error.response?.data?.error || 'Failed to send OTP');
  } finally {
    setLoading(false);
  }
};
```

**Expected Response:**
```typescript
{
  success: true;
  message: string; // "کد تایید ارسال شد" or "OTP sent successfully"
}
```

**UI States:**
- **Loading:** Disable button, show spinner on button
- **Success:** Navigate to OTP screen, show success toast
- **Error:** Show error message below input field
  - Invalid phone number format
  - Rate limit exceeded (too many attempts)
  - Network error

**UI Elements:**
```typescript
interface PhoneNumberScreenState {
  phoneNumber: string;
  loading: boolean;
  error: string | null;
}

// UI Mapping
<TextInput 
  value={phoneNumber}
  editable={!loading}
  errorMessage={error}
/>
<Button 
  title="ارسال کد"
  loading={loading}
  disabled={!isValidPhoneNumber || loading}
  onPress={sendOTP}
/>
```

---

### 1.2 OTP Verification Screen

**Screen Name:** `OTPVerificationScreen`

#### API Call: Verify OTP

**When:** User enters 6-digit OTP code (auto-submit when complete)

**Endpoint:** `POST /auth/verify-otp`

**Request Payload:**
```typescript
{
  phoneNumber: string;  // From previous screen
  otpCode: string;      // e.g., "123456"
}
```

**Code Example:**
```typescript
const verifyOTP = async (otpCode: string) => {
  setLoading(true);
  setError(null);
  
  try {
    const response = await apiClient.post('/auth/verify-otp', {
      phoneNumber,
      otpCode,
    });
    
    // Store tokens securely
    await secureStorage.setItem('accessToken', response.data.accessToken);
    await secureStorage.setItem('refreshToken', response.data.refreshToken);
    
    // Store user data
    await storage.setItem('user', JSON.stringify(response.data.user));
    
    // Update API client with token
    apiClient.defaults.headers.Authorization = `Bearer ${response.data.accessToken}`;
    
    // Navigate to main app
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  } catch (error) {
    setError(error.response?.data?.error || 'Invalid OTP code');
    // Clear OTP input on error
    setOtpCode('');
  } finally {
    setLoading(false);
  }
};
```

**Expected Response:**
```typescript
{
  success: true;
  accessToken: string;    // JWT token
  refreshToken: string;   // Refresh token
  user: {
    id: string;
    phone: string;
  };
}
```

**UI States:**
- **Loading:** Show spinner overlay, disable input
- **Success:** Navigate to main app (Dashboard)
- **Error:** 
  - Invalid OTP code (show error, clear input)
  - OTP expired (show "Resend" button)
  - Network error

**UI Elements:**
```typescript
interface OTPScreenState {
  otpCode: string;
  loading: boolean;
  error: string | null;
  countdown: number; // Resend countdown (60s)
}

// Auto-submit when 6 digits entered
useEffect(() => {
  if (otpCode.length === 6) {
    verifyOTP(otpCode);
  }
}, [otpCode]);

// UI Mapping
<OTPInput 
  value={otpCode}
  length={6}
  editable={!loading}
  errorMessage={error}
  onComplete={verifyOTP}
/>
<Button 
  title="ارسال مجدد"
  disabled={countdown > 0 || loading}
  onPress={resendOTP}
/>
{countdown > 0 && <Text>{countdown}s</Text>}
```

---

## 2. Dashboard Screen

**Screen Name:** `DashboardScreen` / `HomeScreen`

### 2.1 Initial Load

**When:** Screen mounts (on app launch or tab switch)

**Endpoint:** `GET /dashboard`

**Request Payload:** None (token in header)

**Code Example:**
```typescript
const loadDashboard = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const response = await apiClient.get('/dashboard');
    
    // Update state
    setCars(response.data.cars);
    setUpcomingReminders(response.data.upcomingReminders);
    setRecentServices(response.data.recentServices);
    setAlerts(response.data.alerts);
    setStats(response.data.stats);
    
    // Select first car by default
    if (response.data.cars.length > 0) {
      setSelectedCar(response.data.cars[0]);
    }
  } catch (error) {
    setError(error.response?.data?.error || 'Failed to load dashboard');
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadDashboard();
}, []);

// Pull to refresh
const onRefresh = async () => {
  setRefreshing(true);
  await loadDashboard();
  setRefreshing(false);
};
```

**Expected Response:**
```typescript
{
  cars: Array<{
    id: string;
    brand: string;           // "تویوتا"
    model: string;           // "کمری"
    year: number;            // 2020
    color: string;           // "نقره‌ای"
    licensePlate: string;    // "۱۲ الف ۳۴۵ ایران ۶۷"
    currentMileage: number;  // 45000
    lastServiceDate: string | null; // "2024-01-10"
    upcomingReminders: number; // 2
    insurance: {
      endDate: string;        // "2024-12-31"
      daysUntilExpiry: number; // 245
      isExpiringSoon: boolean; // false
    } | null;
    technicalInspection: {
      expiryDate: string;     // "2024-07-05"
      daysUntilExpiry: number; // 135
      isExpiringSoon: boolean; // false
    } | null;
  }>;
  upcomingReminders: Array<{
    id: string;
    carId: string;
    title: string;           // "تعویض روغن موتور"
    description: string;
    dueDate: string | null;  // "2024-02-15"
    dueMileage: number | null; // 50000
    daysUntilDue: number | null; // 15
    kmUntilDue: number | null;   // 5000
    isOverdue: boolean;      // false
    category: {
      nameFa: string;        // "تعویض روغن"
      icon: string;          // "oil"
      color: string;         // "#9B59B6"
    };
    car: {
      brand: string;         // "تویوتا"
      model: string;         // "کمری"
    };
  }>;
  recentServices: Array<{
    id: string;
    serviceDate: string;     // "2024-01-10"
    mileage: number;         // 44500
    cost: number;            // 2500000
    currency: string;        // "toman"
    category: {
      nameFa: string;        // "تعویض روغن"
      icon: string;          // "oil"
      color: string;         // "#9B59B6"
    };
    car: {
      brand: string;
      model: string;
    };
  }>;
  alerts: Array<{
    type: "insurance_expiring" | "inspection_expiring";
    carId: string;
    message: string;         // "بیمه تویوتا کمری تا ۳۰ روز دیگر منقضی می‌شود"
    severity: "warning" | "error";
    daysUntil: number;       // 30
  }>;
  stats: {
    totalCars: number;       // 3
    totalServices: number;   // 45
    totalCostThisYear: number; // 50000000
    upcomingRemindersCount: number; // 5
  };
}
```

**UI Mapping:**

```typescript
interface DashboardState {
  cars: Car[];
  selectedCar: Car | null;
  upcomingReminders: Reminder[];
  recentServices: Service[];
  alerts: Alert[];
  stats: Stats;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
}

// Car Slider
<Carousel
  data={cars}
  renderItem={({ item }) => <CarCard car={item} />}
  onSnapToItem={(index) => setSelectedCar(cars[index])}
/>

// Alerts Section (if alerts.length > 0)
{alerts.map(alert => (
  <AlertBanner
    key={alert.type + alert.carId}
    type={alert.severity}
    message={alert.message}
  />
))}

// Upcoming Services Section
<SectionHeader title="سرویس‌های پیش‌رو" count={upcomingReminders.length} />
{upcomingReminders.slice(0, 3).map(reminder => (
  <ReminderCard
    key={reminder.id}
    reminder={reminder}
    onPress={() => navigation.navigate('ReminderDetails', { id: reminder.id })}
  />
))}

// Service History Timeline
<SectionHeader title="تاریخچه سرویس‌ها" />
{recentServices.slice(0, 5).map(service => (
  <ServiceHistoryItem
    key={service.id}
    service={service}
    onPress={() => navigation.navigate('ServiceDetails', { id: service.id })}
  />
))}

// Stats Cards
<StatsGrid>
  <StatCard title="تعداد خودرو" value={stats.totalCars} />
  <StatCard title="کل سرویس‌ها" value={stats.totalServices} />
  <StatCard title="هزینه امسال" value={formatPrice(stats.totalCostThisYear)} />
</StatsGrid>
```

**UI States:**

- **Loading (Initial):** 
  ```typescript
  <View>
    <Skeleton height={200} /> {/* Car slider skeleton */}
    <Skeleton height={100} count={3} /> {/* Reminders skeleton */}
  </View>
  ```

- **Empty State (No Cars):**
  ```typescript
  <EmptyState
    icon="car"
    title="هنوز خودرویی ثبت نشده"
    description="برای شروع، اولین خودروی خود را اضافه کنید"
    actionLabel="افزودن خودرو"
    onAction={() => navigation.navigate('AddCar')}
  />
  ```

- **Error State:**
  ```typescript
  <ErrorState
    message={error}
    onRetry={loadDashboard}
  />
  ```

- **Success State:** Display all data sections

---

### 2.2 Car Selection (Carousel Swipe)

**When:** User swipes car carousel to select different car

**Endpoint:** None (local state update)

**Code Example:**
```typescript
const onCarSelected = (index: number) => {
  const car = cars[index];
  setSelectedCar(car);
  
  // Filter reminders and services for selected car
  const carReminders = upcomingReminders.filter(r => r.carId === car.id);
  const carServices = recentServices.filter(s => s.car.id === car.id);
  
  setFilteredReminders(carReminders);
  setFilteredServices(carServices);
};

<Carousel
  data={cars}
  onSnapToItem={onCarSelected}
/>
```

**UI Updates:**
- Update displayed reminders (filter by car)
- Update displayed services (filter by car)
- Update car-specific info (insurance, inspection status)

---

## 3. Add Service Flow

### 3.1 Step 1: Select Car Screen

**Screen Name:** `AddServiceSelectCarScreen`

**When:** Screen mounts

**Endpoint:** `GET /cars`

**Request Payload:** None

**Code Example:**
```typescript
const loadCars = async () => {
  setLoading(true);
  try {
    const response = await apiClient.get('/cars');
    setCars(response.data.cars);
    
    // Pre-select if came from dashboard
    if (route.params?.selectedCarId) {
      const car = response.data.cars.find(c => c.id === route.params.selectedCarId);
      if (car) setSelectedCar(car);
    }
  } catch (error) {
    setError(error.response?.data?.error);
  } finally {
    setLoading(false);
  }
};
```

**Expected Response:**
```typescript
{
  cars: Array<{
    id: string;
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
    currentMileage: number;
    stats: {
      totalServices: number;
      lastServiceDate: string | null;
    };
  }>;
}
```

**UI Mapping:**
```typescript
<CarList
  data={cars}
  selected={selectedCar?.id}
  onSelect={(car) => {
    setSelectedCar(car);
    navigation.navigate('AddServiceDetails', { car });
  }}
/>
```

---

### 3.2 Step 2: Service Details Screen

**Screen Name:** `AddServiceDetailsScreen`

#### API Call 1: Load Service Categories

**When:** Screen mounts

**Endpoint:** `GET /service-categories?language=fa`

**Request Payload:** None (public endpoint)

**Code Example:**
```typescript
const loadCategories = async () => {
  try {
    const response = await apiClient.get('/service-categories', {
      params: { language: i18n.language },
    });
    setCategories(response.data.categories);
  } catch (error) {
    console.error('Failed to load categories:', error);
  }
};
```

**Expected Response:**
```typescript
{
  categories: Array<{
    id: string;
    key: string;           // "oil"
    nameEn: string;        // "Oil Change"
    nameFa: string;        // "تعویض روغن"
    icon: string;          // "oil"
    color: string;         // "#9B59B6"
    displayOrder: number;
  }>;
}
```

#### API Call 2: Load Checklist Items

**When:** User selects a category

**Endpoint:** `GET /service-categories/:categoryId/checklist?language=fa`

**Request Payload:** None

**Code Example:**
```typescript
const loadChecklistItems = async (categoryId: string) => {
  setLoadingChecklist(true);
  try {
    const response = await apiClient.get(
      `/service-categories/${categoryId}/checklist`,
      { params: { language: i18n.language } }
    );
    setChecklistItems(response.data.items);
  } catch (error) {
    console.error('Failed to load checklist:', error);
  } finally {
    setLoadingChecklist(false);
  }
};

// Trigger when category selected
const onCategorySelect = (category: Category) => {
  setSelectedCategory(category);
  loadChecklistItems(category.id);
};
```

**Expected Response:**
```typescript
{
  items: Array<{
    id: string;
    categoryId: string;
    nameEn: string;        // "Engine oil replacement"
    nameFa: string;        // "تعویض روغن موتور"
    displayOrder: number;
  }>;
}
```

**Form State:**
```typescript
interface AddServiceFormState {
  // Selected data
  car: Car;
  category: Category | null;
  
  // Service details
  serviceDate: Date;
  mileage: number;
  cost: number;
  currency: "toman";
  description: string;
  notes: string;
  serviceProvider: string;
  serviceProviderPhone: string;
  
  // Checklist items
  checklistItems: Array<{
    id: string;
    name: string;
    isChecked: boolean;
    notes: string;
  }>;
  customItems: Array<{
    name: string;
    isChecked: boolean;
    notes: string;
  }>;
  
  // UI state
  loading: boolean;
  errors: Record<string, string>;
}
```

**UI Mapping:**
```typescript
// Category selection
<CategoryGrid
  data={categories}
  selected={selectedCategory?.id}
  onSelect={onCategorySelect}
/>

// Service details form
<DatePicker
  label="تاریخ سرویس"
  value={serviceDate}
  onChange={setServiceDate}
  error={errors.serviceDate}
  required
/>
<PersianNumberInput
  label="کیلومتر"
  value={mileage}
  onChange={setMileage}
  placeholder={`کیلومتر فعلی: ${car.currentMileage}`}
/>
<PersianNumberInput
  label="هزینه (تومان)"
  value={cost}
  onChange={setCost}
/>

// Checklist items
<ChecklistSection>
  {checklistItems.map(item => (
    <CheckboxItem
      key={item.id}
      label={item.nameFa}
      checked={item.isChecked}
      onToggle={() => toggleChecklistItem(item.id)}
      onNotesChange={(notes) => updateItemNotes(item.id, notes)}
    />
  ))}
</ChecklistSection>

// Custom items
<Button
  title="افزودن مورد جدید"
  onPress={addCustomItem}
/>
```

---

### 3.3 Step 3: Reminder Setup (Optional)

**Screen Name:** `AddServiceReminderScreen`

**When:** User toggles "Add reminder" and fills reminder form

**Code Example:**
```typescript
interface ReminderFormState {
  enabled: boolean;
  title: string;
  description: string;
  dueDate: Date | null;
  dueMileage: number | null;
  notifyDaysBefore: number; // Default: 7
  notifyKmBefore: number;   // Default: 500
}

const [reminderForm, setReminderForm] = useState<ReminderFormState>({
  enabled: false,
  title: `تعویض روغن بعدی`, // Auto-fill from category
  description: '',
  dueDate: null,
  dueMileage: null,
  notifyDaysBefore: 7,
  notifyKmBefore: 500,
});
```

**UI Mapping:**
```typescript
<Switch
  label="افزودن یادآوری برای سرویس بعدی"
  value={reminderForm.enabled}
  onValueChange={(enabled) => setReminderForm({ ...reminderForm, enabled })}
/>

{reminderForm.enabled && (
  <>
    <TextInput
      label="عنوان یادآوری"
      value={reminderForm.title}
      onChange={(title) => setReminderForm({ ...reminderForm, title })}
    />
    <DatePicker
      label="تاریخ سررسید"
      value={reminderForm.dueDate}
      onChange={(dueDate) => setReminderForm({ ...reminderForm, dueDate })}
    />
    <PersianNumberInput
      label="کیلومتر سررسید"
      value={reminderForm.dueMileage}
      onChange={(dueMileage) => setReminderForm({ ...reminderForm, dueMileage })}
    />
  </>
)}
```

---

### 3.4 Step 4: Submit Service

**When:** User taps "ثبت سرویس" button

**Endpoint:** `POST /cars/:carId/services`

**Request Payload:**
```typescript
{
  categoryId: string;
  serviceDate: string;          // "2024-01-10" (ISO date)
  mileage?: number;
  cost?: number;
  currency?: string;            // "toman"
  description?: string;
  notes?: string;
  serviceProvider?: string;
  serviceProviderPhone?: string;
  items: Array<{
    checklistItemId?: string;   // For predefined items
    customItemName?: string;    // For custom items
    isChecked: boolean;
    notes?: string;
  }>;
}
```

**Code Example:**
```typescript
const submitService = async () => {
  // Validate form
  const validationErrors = validateServiceForm(formState);
  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }
  
  setSubmitting(true);
  setError(null);
  
  try {
    // 1. Create service
    const servicePayload = {
      categoryId: selectedCategory.id,
      serviceDate: formatDate(serviceDate), // "2024-01-10"
      mileage: mileage || undefined,
      cost: cost || undefined,
      currency: 'toman',
      description: description || undefined,
      notes: notes || undefined,
      serviceProvider: serviceProvider || undefined,
      serviceProviderPhone: serviceProviderPhone || undefined,
      items: [
        // Predefined checklist items
        ...checklistItems
          .filter(item => item.isChecked)
          .map(item => ({
            checklistItemId: item.id,
            isChecked: true,
            notes: item.notes || undefined,
          })),
        // Custom items
        ...customItems.map(item => ({
          customItemName: item.name,
          isChecked: item.isChecked,
          notes: item.notes || undefined,
        })),
      ],
    };
    
    const serviceResponse = await apiClient.post(
      `/cars/${car.id}/services`,
      servicePayload
    );
    
    const createdService = serviceResponse.data.service;
    
    // 2. Create reminder if enabled
    if (reminderForm.enabled) {
      const reminderPayload = {
        categoryId: selectedCategory.id,
        title: reminderForm.title,
        description: reminderForm.description || undefined,
        dueDate: reminderForm.dueDate ? formatDate(reminderForm.dueDate) : undefined,
        dueMileage: reminderForm.dueMileage || undefined,
        notifyDaysBefore: reminderForm.notifyDaysBefore,
        notifyKmBefore: reminderForm.notifyKmBefore,
      };
      
      await apiClient.post(
        `/cars/${car.id}/reminders`,
        reminderPayload
      );
    }
    
    // Success - show confirmation and navigate
    showToast('سرویس با موفقیت ثبت شد', 'success');
    
    // Navigate to service details or back to dashboard
    navigation.reset({
      index: 0,
      routes: [
        { name: 'MainTabs' },
        { name: 'ServiceDetails', params: { id: createdService.id } },
      ],
    });
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'خطا در ثبت سرویس';
    setError(errorMessage);
    showToast(errorMessage, 'error');
  } finally {
    setSubmitting(false);
  }
};
```

**Expected Response:**
```typescript
{
  success: true;
  service: {
    id: string;
    carId: string;
    categoryId: string;
    serviceDate: string;
    mileage: number;
    cost: number;
    // ... all other fields
  };
}
```

**UI States:**

- **Submitting:** 
  ```typescript
  <Button
    title="ثبت سرویس"
    loading={submitting}
    disabled={submitting || !isFormValid}
    onPress={submitService}
  />
  <LoadingOverlay visible={submitting} message="در حال ثبت سرویس..." />
  ```

- **Success:**
  ```typescript
  <SuccessModal
    visible={showSuccess}
    title="سرویس ثبت شد"
    message="سرویس با موفقیت ثبت شد"
    onClose={() => navigation.goBack()}
  />
  ```

- **Error:**
  ```typescript
  <Alert
    type="error"
    message={error}
    onClose={() => setError(null)}
  />
  ```

---

## 4. Upcoming Services Screen

**Screen Name:** `UpcomingServicesScreen` / `RemindersScreen`

### 4.1 Load Reminders

**When:** Screen mounts, pull to refresh

**Endpoint:** `GET /reminders/upcoming?limit=50`

**Request Payload:** None

**Code Example:**
```typescript
const loadReminders = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const response = await apiClient.get('/reminders/upcoming', {
      params: { limit: 50 },
    });
    
    setReminders(response.data.reminders);
    
    // Group by car for better UI
    const grouped = groupBy(response.data.reminders, 'carId');
    setGroupedReminders(grouped);
  } catch (error) {
    setError(error.response?.data?.error || 'Failed to load reminders');
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadReminders();
}, []);

// Pull to refresh
const onRefresh = async () => {
  setRefreshing(true);
  await loadReminders();
  setRefreshing(false);
};
```

**Expected Response:**
```typescript
{
  reminders: Array<{
    id: string;
    carId: string;
    title: string;
    description: string;
    dueDate: string | null;
    dueMileage: number | null;
    daysUntilDue: number | null;
    kmUntilDue: number | null;
    isOverdue: boolean;
    status: "upcoming";
    category: {
      id: string;
      nameFa: string;
      icon: string;
      color: string;
    };
    car: {
      id: string;
      brand: string;
      model: string;
      licensePlate: string;
      currentMileage: number;
    };
  }>;
}
```

**UI Mapping:**
```typescript
interface ReminderCardProps {
  reminder: Reminder;
  onDone: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

<SectionList
  sections={Object.entries(groupedReminders).map(([carId, reminders]) => ({
    title: `${reminders[0].car.brand} ${reminders[0].car.model}`,
    data: reminders,
  }))}
  renderSectionHeader={({ section }) => (
    <SectionHeader title={section.title} />
  )}
  renderItem={({ item }) => (
    <ReminderCard
      reminder={item}
      onDone={() => markReminderDone(item.id)}
      onDelete={() => deleteReminder(item.id)}
      onEdit={() => navigation.navigate('EditReminder', { id: item.id })}
    />
  )}
  ListEmptyComponent={<EmptyState icon="bell" title="یادآوری فعالی وجود ندارد" />}
/>

// Reminder card UI
const ReminderCard = ({ reminder, onDone, onDelete }) => (
  <SwipeableCard
    leftAction={{ icon: 'check', color: 'green', onPress: onDone }}
    rightAction={{ icon: 'trash', color: 'red', onPress: onDelete }}
  >
    <View>
      <Badge color={reminder.category.color} icon={reminder.category.icon} />
      <Text>{reminder.title}</Text>
      
      {/* Due date info */}
      {reminder.dueDate && (
        <DueDateBadge
          date={reminder.dueDate}
          daysUntil={reminder.daysUntilDue}
          isOverdue={reminder.isOverdue}
        />
      )}
      
      {/* Due mileage info */}
      {reminder.dueMileage && (
        <DueMileageBadge
          mileage={reminder.dueMileage}
          kmUntil={reminder.kmUntilDue}
          isOverdue={reminder.isOverdue}
        />
      )}
      
      <Text secondary>{reminder.car.licensePlate}</Text>
    </View>
  </SwipeableCard>
);
```

**UI States:**

- **Loading:** Show skeleton cards
- **Empty:** Display empty state with "Add Reminder" button
- **Success:** Display reminders grouped by car
- **Error:** Show error message with retry button

---

### 4.2 Mark Reminder as Done

**When:** User swipes left and taps "Done" button

**Endpoint:** `POST /cars/:carId/reminders/:reminderId/complete`

**Request Payload:**
```typescript
{
  serviceId?: string; // Optional: link to completed service
}
```

**Code Example:**
```typescript
const markReminderDone = async (reminderId: string) => {
  const reminder = reminders.find(r => r.id === reminderId);
  if (!reminder) return;
  
  // Show confirmation dialog
  const confirmed = await showConfirmDialog({
    title: 'تکمیل یادآوری',
    message: 'آیا این سرویس انجام شده است؟',
    confirmText: 'بله، انجام شد',
    cancelText: 'انصراف',
  });
  
  if (!confirmed) return;
  
  try {
    await apiClient.post(
      `/cars/${reminder.carId}/reminders/${reminderId}/complete`,
      { serviceId: undefined } // Can link to service if created
    );
    
    // Update local state (optimistic update)
    setReminders(prev => prev.filter(r => r.id !== reminderId));
    
    showToast('یادآوری تکمیل شد', 'success');
  } catch (error) {
    showToast('خطا در تکمیل یادآوری', 'error');
    // Reload to get fresh data
    loadReminders();
  }
};
```

**Expected Response:**
```typescript
{
  success: true;
  reminder: {
    id: string;
    status: "completed";
    completedAt: string;
    completedServiceId: string | null;
  };
}
```

---

### 4.3 Delete Reminder

**When:** User swipes right and taps "Delete" button

**Endpoint:** `DELETE /cars/:carId/reminders/:reminderId`

**Request Payload:** None

**Code Example:**
```typescript
const deleteReminder = async (reminderId: string) => {
  const reminder = reminders.find(r => r.id === reminderId);
  if (!reminder) return;
  
  // Show confirmation dialog
  const confirmed = await showConfirmDialog({
    title: 'حذف یادآوری',
    message: 'آیا مطمئن هستید که می‌خواهید این یادآوری را حذف کنید؟',
    confirmText: 'حذف',
    cancelText: 'انصراف',
    destructive: true,
  });
  
  if (!confirmed) return;
  
  // Optimistic update
  setReminders(prev => prev.filter(r => r.id !== reminderId));
  
  try {
    await apiClient.delete(
      `/cars/${reminder.carId}/reminders/${reminderId}`
    );
    
    showToast('یادآوری حذف شد', 'success');
  } catch (error) {
    // Revert optimistic update
    loadReminders();
    showToast('خطا در حذف یادآوری', 'error');
  }
};
```

**Expected Response:**
```typescript
{
  success: true;
  message: "Reminder deleted successfully";
}
```

---

## 5. Service History Screen

**Screen Name:** `ServiceHistoryScreen`

### 5.1 Load Service History

**When:** Screen mounts, car selection changes

**Endpoint:** `GET /cars/:carId/services?limit=20&offset=0`

**Request Payload:** Query params for filtering

**Code Example:**
```typescript
interface ServiceHistoryState {
  services: Service[];
  filters: {
    carId: string | null;
    category: string | null;
    fromDate: Date | null;
    toDate: Date | null;
  };
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
}

const loadServices = async (loadMore = false) => {
  if (loadMore) {
    setLoadingMore(true);
  } else {
    setLoading(true);
  }
  
  try {
    const params: any = {
      limit: pagination.limit,
      offset: loadMore ? pagination.offset : 0,
    };
    
    // Apply filters
    if (filters.category) {
      params.category = filters.category;
    }
    if (filters.fromDate) {
      params.fromDate = formatDate(filters.fromDate);
    }
    if (filters.toDate) {
      params.toDate = formatDate(filters.toDate);
    }
    
    const response = await apiClient.get(
      `/cars/${filters.carId}/services`,
      { params }
    );
    
    if (loadMore) {
      setServices(prev => [...prev, ...response.data.services]);
    } else {
      setServices(response.data.services);
    }
    
    setPagination({
      ...pagination,
      total: response.data.pagination.total,
      offset: loadMore 
        ? pagination.offset + pagination.limit 
        : pagination.limit,
    });
  } catch (error) {
    setError(error.response?.data?.error);
  } finally {
    setLoading(false);
    setLoadingMore(false);
  }
};

// Load more on scroll
const onEndReached = () => {
  if (!loadingMore && services.length < pagination.total) {
    loadServices(true);
  }
};
```

**Expected Response:**
```typescript
{
  services: Array<{
    id: string;
    carId: string;
    serviceDate: string;
    mileage: number;
    cost: number;
    currency: string;
    description: string;
    notes: string;
    serviceProvider: string;
    category: {
      id: string;
      key: string;
      nameFa: string;
      icon: string;
      color: string;
    };
    items: Array<{
      id: string;
      checklistItemId: string | null;
      name: string;
      isChecked: boolean;
      notes: string | null;
    }>;
    createdAt: string;
  }>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}
```

**UI Mapping:**
```typescript
<View>
  {/* Filter bar */}
  <FilterBar>
    <CarSelector
      selectedCarId={filters.carId}
      onSelect={(carId) => setFilters({ ...filters, carId })}
    />
    <CategoryFilter
      selected={filters.category}
      onSelect={(category) => setFilters({ ...filters, category })}
    />
    <DateRangeFilter
      from={filters.fromDate}
      to={filters.toDate}
      onChange={(from, to) => setFilters({ ...filters, fromDate: from, toDate: to })}
    />
  </FilterBar>
  
  {/* Service list */}
  <FlatList
    data={services}
    renderItem={({ item }) => (
      <ServiceCard
        service={item}
        onPress={() => navigation.navigate('ServiceDetails', { id: item.id })}
        onEdit={() => navigation.navigate('EditService', { id: item.id })}
        onDelete={() => deleteService(item.id)}
      />
    )}
    ListEmptyComponent={
      <EmptyState
        icon="wrench"
        title="سرویسی ثبت نشده"
        description="سرویس‌های انجام شده اینجا نمایش داده می‌شود"
      />
    }
    onEndReached={onEndReached}
    onEndReachedThreshold={0.5}
    ListFooterComponent={loadingMore ? <LoadingSpinner /> : null}
  />
</View>

// Service card with accordion
const ServiceCard = ({ service, onPress, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card onPress={() => setExpanded(!expanded)}>
      {/* Header */}
      <CardHeader>
        <Badge color={service.category.color} icon={service.category.icon} />
        <Text bold>{service.category.nameFa}</Text>
        <Text secondary>{formatPersianDate(service.serviceDate)}</Text>
      </CardHeader>
      
      {/* Summary */}
      <CardBody>
        <InfoRow icon="gauge" label="کیلومتر" value={toPersianNumber(service.mileage)} />
        <InfoRow icon="money" label="هزینه" value={formatPrice(service.cost)} />
        {service.serviceProvider && (
          <InfoRow icon="shop" label="تعمیرگاه" value={service.serviceProvider} />
        )}
      </CardBody>
      
      {/* Expandable details */}
      {expanded && (
        <CardDetails>
          {/* Service items */}
          <SectionTitle>موارد انجام شده</SectionTitle>
          {service.items.map(item => (
            <ChecklistItem
              key={item.id}
              label={item.name}
              checked={item.isChecked}
              notes={item.notes}
            />
          ))}
          
          {/* Notes */}
          {service.notes && (
            <>
              <SectionTitle>یادداشت‌ها</SectionTitle>
              <Text>{service.notes}</Text>
            </>
          )}
          
          {/* Actions */}
          <CardActions>
            <Button variant="outline" icon="edit" onPress={onEdit}>
              ویرایش
            </Button>
            <Button variant="outline" icon="trash" onPress={onDelete}>
              حذف
            </Button>
          </CardActions>
        </CardDetails>
      )}
    </Card>
  );
};
```

**UI States:**

- **Loading (Initial):** Skeleton cards
- **Loading More:** Small spinner at bottom
- **Empty (No Services):** Empty state with "Add Service" button
- **Empty (Filtered):** "No services match your filters"
- **Error:** Error message with retry button

---

### 5.2 Delete Service

**When:** User taps delete button on service card

**Endpoint:** `DELETE /cars/:carId/services/:serviceId`

**Request Payload:** None

**Code Example:**
```typescript
const deleteService = async (serviceId: string) => {
  const service = services.find(s => s.id === serviceId);
  if (!service) return;
  
  const confirmed = await showConfirmDialog({
    title: 'حذف سرویس',
    message: 'آیا مطمئن هستید؟ این عملیات قابل بازگشت نیست.',
    confirmText: 'حذف',
    cancelText: 'انصراف',
    destructive: true,
  });
  
  if (!confirmed) return;
  
  // Optimistic update
  setServices(prev => prev.filter(s => s.id !== serviceId));
  
  try {
    await apiClient.delete(`/cars/${service.carId}/services/${serviceId}`);
    showToast('سرویس حذف شد', 'success');
  } catch (error) {
    // Revert
    loadServices();
    showToast('خطا در حذف سرویس', 'error');
  }
};
```

---

## 6. Car Management

### 6.1 Car List Screen

**Screen Name:** `CarManagementScreen` / `MyCarsScreen`

**When:** Screen mounts (accessed from dashboard)

**Endpoint:** `GET /cars?includeInactive=false`

**Code Example:**
```typescript
const loadCars = async () => {
  setLoading(true);
  try {
    const response = await apiClient.get('/cars', {
      params: { includeInactive: showInactive },
    });
    setCars(response.data.cars);
  } catch (error) {
    setError(error.response?.data?.error);
  } finally {
    setLoading(false);
  }
};
```

**Expected Response:** (Same as dashboard cars response)

**UI Mapping:**
```typescript
<FlatList
  data={cars}
  renderItem={({ item }) => (
    <CarCard
      car={item}
      onPress={() => navigation.navigate('CarDetails', { id: item.id })}
      onEdit={() => navigation.navigate('EditCar', { id: item.id })}
      onDelete={() => deleteCar(item.id)}
    />
  )}
  ListHeaderComponent={
    <Button
      title="افزودن خودرو"
      icon="plus"
      onPress={() => navigation.navigate('AddCar')}
    />
  }
/>
```

---

### 6.2 Add Car Screen

**Screen Name:** `AddCarScreen`

**When:** User fills form and taps "ثبت خودرو"

**Endpoint:** `POST /cars`

**Request Payload:**
```typescript
{
  brand: string;           // Required: "تویوتا"
  model: string;           // Required: "کمری"
  year?: number;           // Optional: 2020
  color?: string;          // Optional: "نقره‌ای"
  licensePlate?: string;   // Optional: "۱۲ الف ۳۴۵ ایران ۶۷"
  vin?: string;            // Optional: "1HGBH41JXMN109186"
  currentMileage?: number; // Optional: 45000
}
```

**Code Example:**
```typescript
const submitCar = async () => {
  // Validate
  const errors = validateCarForm(formState);
  if (Object.keys(errors).length > 0) {
    setErrors(errors);
    return;
  }
  
  setSubmitting(true);
  try {
    const payload = {
      brand: formState.brand,
      model: formState.model,
      year: formState.year || undefined,
      color: formState.color || undefined,
      licensePlate: formState.licensePlate || undefined,
      vin: formState.vin || undefined,
      currentMileage: formState.currentMileage || undefined,
    };
    
    const response = await apiClient.post('/cars', payload);
    
    showToast('خودرو با موفقیت اضافه شد', 'success');
    navigation.goBack();
    
    // Refresh car list in parent screen
    navigation.dispatch(CommonActions.setParams({ refresh: true }));
  } catch (error) {
    setError(error.response?.data?.error || 'Failed to add car');
  } finally {
    setSubmitting(false);
  }
};
```

**Expected Response:**
```typescript
{
  success: true;
  car: {
    id: string;
    userId: string;
    brand: string;
    model: string;
    // ... all fields
    displayOrder: number;
    isActive: true;
    createdAt: string;
  };
}
```

**UI Mapping:**
```typescript
<Form>
  <TextInput
    label="برند خودرو *"
    value={formState.brand}
    onChange={(brand) => setFormState({ ...formState, brand })}
    error={errors.brand}
    required
  />
  <TextInput
    label="مدل خودرو *"
    value={formState.model}
    onChange={(model) => setFormState({ ...formState, model })}
    error={errors.model}
    required
  />
  <NumberInput
    label="سال ساخت"
    value={formState.year}
    onChange={(year) => setFormState({ ...formState, year })}
    placeholder="1399"
  />
  <ColorPicker
    label="رنگ"
    value={formState.color}
    onChange={(color) => setFormState({ ...formState, color })}
  />
  <TextInput
    label="پلاک"
    value={formState.licensePlate}
    onChange={(licensePlate) => setFormState({ ...formState, licensePlate })}
    keyboardType="default"
  />
  <PersianNumberInput
    label="کیلومتر فعلی"
    value={formState.currentMileage}
    onChange={(currentMileage) => setFormState({ ...formState, currentMileage })}
  />
  
  <Button
    title="ثبت خودرو"
    loading={submitting}
    disabled={!isFormValid || submitting}
    onPress={submitCar}
  />
</Form>
```

---

### 6.3 Edit Car Screen

**Screen Name:** `EditCarScreen`

#### API Call 1: Load Car Details

**When:** Screen mounts

**Endpoint:** `GET /cars/:carId`

**Code Example:**
```typescript
const loadCarDetails = async () => {
  setLoading(true);
  try {
    const response = await apiClient.get(`/cars/${route.params.carId}`);
    setFormState(response.data);
  } catch (error) {
    setError(error.response?.data?.error);
  } finally {
    setLoading(false);
  }
};
```

#### API Call 2: Update Car

**When:** User edits fields and taps "ذخیره تغییرات"

**Endpoint:** `PUT /cars/:carId`

**Request Payload:** (Same as POST, only changed fields)
```typescript
{
  currentMileage?: number;
  color?: string;
  // ... any changed fields
}
```

**Code Example:**
```typescript
const updateCar = async () => {
  setSubmitting(true);
  try {
    const payload = {
      brand: formState.brand,
      model: formState.model,
      year: formState.year,
      color: formState.color,
      licensePlate: formState.licensePlate,
      currentMileage: formState.currentMileage,
    };
    
    await apiClient.put(`/cars/${carId}`, payload);
    
    showToast('تغییرات ذخیره شد', 'success');
    navigation.goBack();
  } catch (error) {
    showToast('خطا در ذخیره تغییرات', 'error');
  } finally {
    setSubmitting(false);
  }
};
```

---

### 6.4 Delete Car

**When:** User taps delete button (with confirmation)

**Endpoint:** `DELETE /cars/:carId?permanent=false`

**Code Example:**
```typescript
const deleteCar = async (carId: string) => {
  const confirmed = await showConfirmDialog({
    title: 'حذف خودرو',
    message: 'آیا مطمئن هستید؟ تمام سرویس‌ها و یادآورهای این خودرو حذف می‌شوند.',
    confirmText: 'حذف',
    cancelText: 'انصراف',
    destructive: true,
  });
  
  if (!confirmed) return;
  
  try {
    await apiClient.delete(`/cars/${carId}`, {
      params: { permanent: false }, // Soft delete by default
    });
    
    showToast('خودرو حذف شد', 'success');
    loadCars(); // Refresh list
  } catch (error) {
    showToast('خطا در حذف خودرو', 'error');
  }
};
```

---

## 7. Insurance & Technical Inspection

### 7.1 Insurance List Screen

**Screen Name:** `InsuranceScreen`

**When:** Screen mounts, car selection changes

**Endpoint:** `GET /cars/:carId/insurance`

**Code Example:**
```typescript
const loadInsurance = async () => {
  setLoading(true);
  try {
    const response = await apiClient.get(`/cars/${selectedCarId}/insurance`);
    setInsuranceRecords(response.data.records);
    
    // Current insurance
    const current = response.data.records.find(r => r.isCurrent);
    setCurrentInsurance(current);
  } catch (error) {
    setError(error.response?.data?.error);
  } finally {
    setLoading(false);
  }
};
```

**Expected Response:**
```typescript
{
  records: Array<{
    id: string;
    carId: string;
    insuranceType: string;    // "third_party", "comprehensive"
    insuranceCompany: string; // "بیمه ایران"
    policyNumber: string;     // "IR-123456789"
    startDate: string;        // "2024-01-01"
    endDate: string;          // "2024-12-31"
    premiumAmount: number;    // 15000000
    currency: string;         // "toman"
    documentUrl: string | null;
    isCurrent: boolean;       // true
    notes: string;
    daysUntilExpiry: number;  // 245
    isExpiringSoon: boolean;  // false
  }>;
}
```

**UI Mapping:**
```typescript
<View>
  {/* Current insurance card */}
  {currentInsurance && (
    <CurrentInsuranceCard
      insurance={currentInsurance}
      onEdit={() => navigation.navigate('EditInsurance', { id: currentInsurance.id })}
    />
  )}
  
  {/* Expiry warning */}
  {currentInsurance?.isExpiringSoon && (
    <Alert
      type="warning"
      message={`بیمه شما تا ${currentInsurance.daysUntilExpiry} روز دیگر منقضی می‌شود`}
    />
  )}
  
  {/* History */}
  <SectionTitle>سوابق بیمه</SectionTitle>
  <FlatList
    data={insuranceRecords.filter(r => !r.isCurrent)}
    renderItem={({ item }) => <InsuranceCard insurance={item} />}
  />
  
  <Button
    title="افزودن بیمه"
    onPress={() => navigation.navigate('AddInsurance', { carId: selectedCarId })}
  />
</View>
```

---

### 7.2 Add Insurance

**When:** User fills form and submits

**Endpoint:** `POST /cars/:carId/insurance`

**Request Payload:**
```typescript
{
  insuranceType: string;      // Required: "third_party"
  insuranceCompany: string;   // Required: "بیمه ایران"
  policyNumber?: string;
  startDate: string;          // Required: "2024-01-01"
  endDate: string;            // Required: "2024-12-31"
  premiumAmount?: number;
  currency?: string;          // "toman"
  notes?: string;
  isCurrent: boolean;         // Default: true
}
```

**Code Example:**
```typescript
const submitInsurance = async () => {
  setSubmitting(true);
  try {
    const payload = {
      insuranceType: formState.insuranceType,
      insuranceCompany: formState.insuranceCompany,
      policyNumber: formState.policyNumber || undefined,
      startDate: formatDate(formState.startDate),
      endDate: formatDate(formState.endDate),
      premiumAmount: formState.premiumAmount || undefined,
      currency: 'toman',
      notes: formState.notes || undefined,
      isCurrent: true,
    };
    
    await apiClient.post(`/cars/${carId}/insurance`, payload);
    
    showToast('بیمه با موفقیت ثبت شد', 'success');
    navigation.goBack();
  } catch (error) {
    showToast('خطا در ثبت بیمه', 'error');
  } finally {
    setSubmitting(false);
  }
};
```

---

### 7.3 Technical Inspection

**Screen Name:** `TechnicalInspectionScreen`

**Endpoint:** `GET /cars/:carId/inspections?current=true`

**Code Example:** (Similar to insurance)

**Add Inspection Endpoint:** `POST /cars/:carId/inspections`

**Request Payload:**
```typescript
{
  inspectionCenter: string;    // Required: "مرکز معاینه فنی شماره ۱"
  certificateNumber?: string;  // "TI-987654321"
  inspectionDate: string;      // Required: "2024-01-05"
  expiryDate: string;          // Required: "2024-07-05"
  passed: boolean;             // Default: true
  notes?: string;
  isCurrent: boolean;          // Default: true
}
```

---

## 8. Insights / Blog

### 8.1 Insights List Screen

**Screen Name:** `InsightsScreen` / `آموزش Screen`

**When:** Screen mounts, category filter changes

**Endpoint:** `GET /insights?language=fa&limit=20&offset=0`

**Request Payload:** Query params

**Code Example:**
```typescript
const loadInsights = async (loadMore = false) => {
  if (loadMore) {
    setLoadingMore(true);
  } else {
    setLoading(true);
  }
  
  try {
    const params = {
      language: i18n.language,
      limit: 20,
      offset: loadMore ? posts.length : 0,
      category: selectedCategory || undefined,
      featured: showFeaturedOnly || undefined,
    };
    
    const response = await apiClient.get('/insights', { params });
    
    if (loadMore) {
      setPosts(prev => [...prev, ...response.data.posts]);
    } else {
      setPosts(response.data.posts);
    }
    
    setPagination(response.data.pagination);
  } catch (error) {
    setError(error.response?.data?.error);
  } finally {
    setLoading(false);
    setLoadingMore(false);
  }
};
```

**Expected Response:**
```typescript
{
  posts: Array<{
    id: string;
    titleEn: string;
    titleFa: string;
    contentEn: string;
    contentFa: string;
    coverImageUrl: string | null;
    videoUrl: string | null;
    category: string;         // "maintenance"
    tags: string[];           // ["oil", "tips"]
    featured: boolean;
    author: string;
    publishedAt: string;
  }>;
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}
```

**UI Mapping (Instagram Stories Style):**
```typescript
// Horizontal scrollable featured posts
<FeaturedStoriesCarousel
  data={posts.filter(p => p.featured)}
  renderItem={({ item }) => (
    <StoryCard
      image={item.coverImageUrl}
      title={item.titleFa}
      onPress={() => openStoryViewer(item)}
    />
  )}
/>

// Grid of all posts
<MasonryGrid
  data={posts}
  renderItem={({ item }) => (
    <InsightCard
      post={item}
      onPress={() => navigation.navigate('InsightDetails', { id: item.id })}
    />
  )}
  onEndReached={() => loadInsights(true)}
/>
```

---

### 8.2 Insight Details Screen

**Screen Name:** `InsightDetailsScreen`

**When:** User taps on a post

**Endpoint:** `GET /insights/:postId?language=fa`

**Code Example:**
```typescript
const loadPostDetails = async () => {
  setLoading(true);
  try {
    const response = await apiClient.get(`/insights/${postId}`, {
      params: { language: i18n.language },
    });
    setPost(response.data);
  } catch (error) {
    setError(error.response?.data?.error);
  } finally {
    setLoading(false);
  }
};
```

**UI Mapping:**
```typescript
<ScrollView>
  {/* Cover image */}
  {post.coverImageUrl && (
    <Image source={{ uri: post.coverImageUrl }} style={styles.cover} />
  )}
  
  {/* Title */}
  <Text style={styles.title}>{post.titleFa}</Text>
  
  {/* Meta */}
  <View style={styles.meta}>
    <Text>{post.author}</Text>
    <Text>{formatPersianDate(post.publishedAt)}</Text>
  </View>
  
  {/* Tags */}
  <View style={styles.tags}>
    {post.tags.map(tag => (
      <Badge key={tag} label={tag} />
    ))}
  </View>
  
  {/* Content */}
  <Markdown>{post.contentFa}</Markdown>
  
  {/* Video (if available) */}
  {post.videoUrl && (
    <VideoPlayer source={{ uri: post.videoUrl }} />
  )}
</ScrollView>
```

---

## 9. Settings Screen

**Screen Name:** `SettingsScreen`

### 9.1 Load Profile

**When:** Screen mounts

**Endpoint:** `GET /profile`

**Code Example:**
```typescript
const loadProfile = async () => {
  setLoading(true);
  try {
    const response = await apiClient.get('/profile');
    setProfile(response.data);
  } catch (error) {
    setError(error.response?.data?.error);
  } finally {
    setLoading(false);
  }
};
```

**Expected Response:**
```typescript
{
  id: string;
  phoneNumber: string;
  displayName: string;
  preferredLanguage: "fa" | "en";
  themePreference: "light" | "dark";
  distanceUnit: "km" | "mi";
  currency: "toman";
  pushNotificationToken: string | null;
  createdAt: string;
  updatedAt: string;
}
```

---

### 9.2 Update Profile

**When:** User changes settings (immediate update on toggle/select)

**Endpoint:** `PUT /profile`

**Request Payload:**
```typescript
{
  displayName?: string;
  preferredLanguage?: "fa" | "en";
  themePreference?: "light" | "dark";
  distanceUnit?: "km" | "mi";
  pushNotificationToken?: string;
}
```

**Code Example:**
```typescript
const updateLanguage = async (language: "fa" | "en") => {
  try {
    await apiClient.put('/profile', {
      preferredLanguage: language,
    });
    
    // Update local state
    i18n.changeLanguage(language);
    setProfile({ ...profile, preferredLanguage: language });
    
    showToast('زبان تغییر یافت', 'success');
  } catch (error) {
    showToast('خطا در تغییر زبان', 'error');
  }
};

const updateTheme = async (theme: "light" | "dark") => {
  try {
    await apiClient.put('/profile', {
      themePreference: theme,
    });
    
    // Update local theme
    setColorScheme(theme);
    setProfile({ ...profile, themePreference: theme });
  } catch (error) {
    showToast('خطا در تغییر تم', 'error');
  }
};
```

**UI Mapping:**
```typescript
<SettingsList>
  {/* Profile */}
  <SettingsSection title="پروفیل">
    <SettingsItem
      label="نام نمایشی"
      value={profile.displayName}
      onPress={() => showEditNameDialog()}
    />
    <SettingsItem
      label="شماره تلفن"
      value={profile.phoneNumber}
      disabled
    />
  </SettingsSection>
  
  {/* Appearance */}
  <SettingsSection title="ظاهر">
    <SettingsItem
      label="زبان"
      value={profile.preferredLanguage === 'fa' ? 'فارسی' : 'English'}
    >
      <Picker
        selectedValue={profile.preferredLanguage}
        onValueChange={updateLanguage}
      >
        <Picker.Item label="فارسی" value="fa" />
        <Picker.Item label="English" value="en" />
      </Picker>
    </SettingsItem>
    
    <SettingsItem label="تم">
      <SegmentedControl
        values={['روشن', 'تیره']}
        selectedIndex={profile.themePreference === 'light' ? 0 : 1}
        onChange={(index) => updateTheme(index === 0 ? 'light' : 'dark')}
      />
    </SettingsItem>
  </SettingsSection>
  
  {/* Preferences */}
  <SettingsSection title="تنظیمات">
    <SettingsItem label="واحد فاصله">
      <SegmentedControl
        values={['کیلومتر', 'مایل']}
        selectedIndex={profile.distanceUnit === 'km' ? 0 : 1}
        onChange={(index) => updateDistanceUnit(index === 0 ? 'km' : 'mi')}
      />
    </SettingsItem>
  </SettingsSection>
  
  {/* Logout */}
  <SettingsSection>
    <SettingsItem
      label="خروج از حساب"
      destructive
      onPress={logout}
    />
  </SettingsSection>
</SettingsList>
```

---

## 10. Global State Management

### 10.1 Recommended State Structure

```typescript
// Context API or Redux store structure

interface AppState {
  // Auth
  auth: {
    isAuthenticated: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    user: User | null;
  };
  
  // User profile
  profile: UserProfile | null;
  
  // Cars (cached)
  cars: {
    data: Car[];
    selectedCarId: string | null;
    loading: boolean;
    lastFetched: number | null;
  };
  
  // Service categories (cached globally)
  serviceCategories: {
    data: ServiceCategory[];
    loading: boolean;
    lastFetched: number | null;
  };
  
  // UI state
  ui: {
    theme: "light" | "dark";
    language: "fa" | "en";
    bottomTab: "dashboard" | "add-service" | "history";
  };
}
```

---

### 10.2 Token Refresh Logic

**When:** Access token expires (401 response)

**Endpoint:** `POST /auth/refresh`

**Code Example:**
```typescript
// Axios interceptor for automatic token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await secureStorage.getItem('refreshToken');
        
        const response = await apiClient.post('/auth/refresh', {
          refreshToken,
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Store new tokens
        await secureStorage.setItem('accessToken', accessToken);
        await secureStorage.setItem('refreshToken', newRefreshToken);
        
        // Update header
        apiClient.defaults.headers.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Retry original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        await logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

---

### 10.3 Cache Invalidation Strategy

```typescript
// Invalidate cache when data changes

const cacheManager = {
  // Cache keys
  CARS: 'cars',
  DASHBOARD: 'dashboard',
  SERVICE_CATEGORIES: 'service_categories',
  
  // Invalidate specific cache
  invalidate: (key: string) => {
    // Clear from AsyncStorage or memory cache
    cache.delete(key);
  },
  
  // Invalidate multiple related caches
  invalidateRelated: (operation: 'car' | 'service' | 'reminder') => {
    if (operation === 'car') {
      cache.delete('cars');
      cache.delete('dashboard');
    } else if (operation === 'service') {
      cache.delete('dashboard');
      cache.delete(`service_history_${carId}`);
    } else if (operation === 'reminder') {
      cache.delete('dashboard');
      cache.delete('upcoming_reminders');
    }
  },
};

// Usage after creating/updating/deleting
const createService = async (data) => {
  const response = await apiClient.post('/cars/:id/services', data);
  
  // Invalidate related caches
  cacheManager.invalidateRelated('service');
  
  return response.data;
};
```

---

## 11. Error Handling & Retry Logic

### 11.1 Error Types & Handling

```typescript
enum ErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  AUTH = 'auth',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

const handleApiError = (error: any): AppError => {
  // Network error
  if (!error.response) {
    return {
      type: ErrorType.NETWORK,
      message: 'خطا در اتصال به اینترنت. لطفا اتصال خود را بررسی کنید.',
      retryable: true,
    };
  }
  
  const { status, data } = error.response;
  
  // Validation error (400)
  if (status === 400) {
    return {
      type: ErrorType.VALIDATION,
      message: data.error || 'داده‌های ورودی نامعتبر است',
      details: data.details,
      retryable: false,
    };
  }
  
  // Auth error (401)
  if (status === 401) {
    return {
      type: ErrorType.AUTH,
      message: 'نشست شما منقضی شده است. لطفا دوباره وارد شوید.',
      retryable: false,
    };
  }
  
  // Server error (500)
  if (status >= 500) {
    return {
      type: ErrorType.SERVER,
      message: 'خطای سرور. لطفا بعدا دوباره تلاش کنید.',
      retryable: true,
    };
  }
  
  return {
    type: ErrorType.UNKNOWN,
    message: data.error || 'خطای نامشخص',
    retryable: false,
  };
};

// Usage in API calls
try {
  const response = await apiClient.get('/dashboard');
  return response.data;
} catch (error) {
  const appError = handleApiError(error);
  
  // Show error to user
  showErrorToast(appError.message);
  
  // Log to error tracking service
  logError(appError, error);
  
  throw appError;
}
```

---

### 11.2 Retry Logic with Exponential Backoff

```typescript
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      const appError = handleApiError(error);
      
      // Don't retry if not retryable
      if (!appError.retryable || attempt === maxRetries - 1) {
        throw error;
      }
      
      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// Usage
const loadDashboard = async () => {
  setLoading(true);
  try {
    const data = await retryWithBackoff(() => 
      apiClient.get('/dashboard').then(r => r.data)
    );
    setData(data);
  } catch (error) {
    setError(handleApiError(error));
  } finally {
    setLoading(false);
  }
};
```

---

### 11.3 Offline Support Strategy

```typescript
// Queue for offline operations
interface OfflineOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  payload: any;
  timestamp: number;
}

const offlineQueue: OfflineOperation[] = [];

// Add to queue when offline
const queueOperation = async (operation: OfflineOperation) => {
  offlineQueue.push(operation);
  await AsyncStorage.setItem('offline_queue', JSON.stringify(offlineQueue));
};

// Process queue when online
const processOfflineQueue = async () => {
  const queue = [...offlineQueue];
  
  for (const operation of queue) {
    try {
      await apiClient({
        method: operation.method,
        url: operation.endpoint,
        data: operation.payload,
      });
      
      // Remove from queue on success
      const index = offlineQueue.findIndex(op => op.id === operation.id);
      if (index > -1) {
        offlineQueue.splice(index, 1);
      }
    } catch (error) {
      console.error('Failed to process offline operation:', error);
      // Keep in queue for next attempt
    }
  }
  
  await AsyncStorage.setItem('offline_queue', JSON.stringify(offlineQueue));
};

// Listen for network state changes
NetInfo.addEventListener(state => {
  if (state.isConnected) {
    processOfflineQueue();
  }
});
```

---

## Summary: API Call Reference by Screen

| Screen | API Calls | Trigger |
|--------|-----------|---------|
| **Phone Entry** | `POST /auth/send-otp` | On submit |
| **OTP Verification** | `POST /auth/verify-otp` | When 6 digits entered |
| **Dashboard** | `GET /dashboard` | On mount, pull-to-refresh |
| **Add Service - Step 1** | `GET /cars` | On mount |
| **Add Service - Step 2** | `GET /service-categories`<br>`GET /service-categories/:id/checklist` | On mount<br>On category select |
| **Add Service - Submit** | `POST /cars/:id/services`<br>`POST /cars/:id/reminders` (optional) | On submit |
| **Upcoming Services** | `GET /reminders/upcoming` | On mount, pull-to-refresh |
| **Reminder Actions** | `POST /cars/:id/reminders/:id/complete`<br>`DELETE /cars/:id/reminders/:id` | On swipe actions |
| **Service History** | `GET /cars/:id/services` | On mount, filter change |
| **Service Delete** | `DELETE /cars/:id/services/:id` | On delete confirm |
| **Car Management** | `GET /cars` | On mount |
| **Add Car** | `POST /cars` | On submit |
| **Edit Car** | `GET /cars/:id`<br>`PUT /cars/:id` | On mount<br>On save |
| **Delete Car** | `DELETE /cars/:id` | On delete confirm |
| **Insurance** | `GET /cars/:id/insurance`<br>`POST /cars/:id/insurance` | On mount<br>On submit |
| **Inspection** | `GET /cars/:id/inspections`<br>`POST /cars/:id/inspections` | On mount<br>On submit |
| **Insights List** | `GET /insights` | On mount, pagination |
| **Insight Details** | `GET /insights/:id` | On mount |
| **Settings** | `GET /profile`<br>`PUT /profile` | On mount<br>On setting change |

---

## Complete Integration Checklist

- [ ] API client configured with base URL and interceptors
- [ ] Token storage implemented (secure storage)
- [ ] Token refresh logic implemented
- [ ] Error handling wrapper created
- [ ] Retry logic with exponential backoff
- [ ] Network state monitoring
- [ ] Offline queue implementation
- [ ] Loading states for all API calls
- [ ] Empty states for all lists
- [ ] Error states with retry buttons
- [ ] Optimistic updates where appropriate
- [ ] Cache invalidation strategy
- [ ] Persian number normalization in inputs
- [ ] Date formatting (Jalali calendar)
- [ ] Pull-to-refresh on all lists
- [ ] Infinite scroll pagination
- [ ] Form validation before submission
- [ ] Success/error toasts for all mutations
- [ ] Confirmation dialogs for destructive actions
- [ ] Analytics tracking for key events
- [ ] Error logging to remote service

This integration map provides everything needed for a developer to implement the complete frontend-backend integration for your mobile app! 🚀
