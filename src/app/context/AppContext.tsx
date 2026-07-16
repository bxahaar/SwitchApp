import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import {
  carsService,
  servicesService,
  remindersService,
  type Car,
  type Service,
  type Reminder,
} from '../../lib/services';
import { useAuth } from './AuthContext';

// Re-export the domain types so existing component imports keep working.
export type { Car, Service, Reminder } from '../../lib/services';

export type Language = 'en' | 'fa';
export type Theme = 'light' | 'dark';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  // Cars
  cars: Car[];
  carsLoading: boolean;
  addCar: (car: Omit<Car, 'id'>) => Promise<void>;
  updateCar: (id: string, car: Partial<Car>) => Promise<void>;
  deleteCar: (id: string) => Promise<void>;
  // Services
  services: Service[];
  servicesLoading: boolean;
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  updateService: (id: string, service: Omit<Service, 'id'>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  // Reminders
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id'>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  t: (key: string) => string;
}

// ── Translations ──────────────────────────────────────────────────────────────
const translations = {
  en: {
    dashboard: 'Dashboard', addService: 'Add Service', cars: 'Cars', insights: 'Insights',
    profile: 'Profile', settings: 'Settings', manageCars: 'Manage Cars',
    upcomingServices: 'Upcoming Services', serviceHistory: 'Service History',
    viewAll: 'View All', at: 'At', in: 'In', km: 'km', days: 'days',
    engine: 'Engine', gearbox: 'Gearbox', brakes: 'Brakes', tires: 'Tires',
    battery: 'Battery', general: 'General',
    selectCar: 'Select Car', selectServiceType: 'Select Service Type',
    serviceDate: 'Service Date', carMileage: 'Car Mileage (km)',
    serviceCost: 'Service Cost', notes: 'Notes / Description',
    nextServiceReminder: 'Next Service Reminder', reminderType: 'Reminder Type',
    byDate: 'By Date', byMileage: 'By Kilometers',
    reminderNote: 'Reminder Note (Optional)',
    save: 'Save', cancel: 'Cancel', nextStep: 'Next Step',
    skipReminder: 'Skip Reminder',
    recordCompletedService: 'Record Completed Service',
    recordReminderOnly: 'Only Record Reminder',
    selectServiceItems: 'Select Service Items',
    serviceItemsOptional: 'Select what was serviced (Optional)',
    addCustomItem: 'Add Custom Item',
    customItemPlaceholder: 'Enter custom service item', skipItems: 'Skip',
    engineOil: 'Engine Oil', oilFilter: 'Oil Filter', airFilter: 'Air Filter',
    cabinFilter: 'Cabin Filter', brakePads: 'Brake Pads', gearboxOil: 'Gearbox Oil',
    gearboxFilter: 'Gearbox Filter', batteryReplacement: 'Battery Replacement',
    tirePressure: 'Tire Pressure Check', coolant: 'Coolant', acGas: 'AC Gas',
    washerFluid: 'Washer Fluid', suspension: 'Suspension', timingBelt: 'Timing Belt',
    exhaust: 'Exhaust System', powerSteeringFluid: 'Power Steering Fluid',
    addNewCar: 'Add New Car', carName: 'Car Name', licensePlate: 'License Plate',
    edit: 'Edit', delete: 'Delete', insurance: 'Insurance',
    technicalInspection: 'Technical Inspection', from: 'From', to: 'To',
    addDates: 'Add Dates', expired: 'Expired', daysRemaining: 'days remaining',
    lightMode: 'Light Mode', darkMode: 'Dark Mode', language: 'Language',
    english: 'English', persian: 'فارسی', settingsDescription: 'Manage your app preferences',
    phoneNumber: 'Phone Number', exportReport: 'Export Service Report',
    cost: 'Cost', mileage: 'Mileage', noServices: 'No services recorded yet',
    noCars: 'No cars added yet',
    serviceHistoryDescription: 'View and export all your service records',
    endOfHistory: 'End of History', serviceItems: 'Service Items', startService: 'Start',
    insightsSubtitle: 'Learn about car maintenance and safe driving',
    pleaseFillAllFields: 'Please fill in all fields', savedSuccessfully: 'Saved successfully!',
    account: 'Account',
  },
  fa: {
    dashboard: 'داشبورد', addService: 'افزودن سرویس', cars: 'خودروها', insights: 'آموزش',
    profile: 'پروفایل', settings: 'تنظیمات', manageCars: 'مدیریت خودروها',
    upcomingServices: 'سرویس‌های پیش‌رو', serviceHistory: 'تاریخچه سرویس',
    viewAll: 'مشاهده همه', at: 'در', in: 'در', km: 'کیلومتر', days: 'روز',
    engine: 'موتور', gearbox: 'گیربکس', brakes: 'ترمز', tires: 'لاستیک',
    battery: 'باتری', general: 'عمومی',
    selectCar: 'انتخاب خودرو', selectServiceType: 'انتخاب نوع سرویس',
    serviceDate: 'تاریخ سرویس', carMileage: 'کیلومتر خودرو',
    serviceCost: 'هزینه سرویس', notes: 'یادداشت / توضیحات',
    nextServiceReminder: 'یادآوری سرویس بعدی', reminderType: 'نوع یادآوری',
    byDate: 'بر اساس تاریخ', byMileage: 'بر اساس کیلومتر',
    reminderNote: 'یادداشت یادآوری (اختیاری)',
    save: 'ذخیره', cancel: 'لغو', nextStep: 'مرحله بعد',
    skipReminder: 'رد کردن یادآوری',
    recordCompletedService: 'ثبت سرویس انجام‌شده',
    recordReminderOnly: 'فقط ثبت یادآوری',
    selectServiceItems: 'انتخاب موارد سرویس',
    serviceItemsOptional: 'انتخاب موارد سرویس شده (اختیاری)',
    addCustomItem: 'افزودن مورد سفارشی',
    customItemPlaceholder: 'مورد سفارشی خود را وارد کنید', skipItems: 'رد کردن',
    engineOil: 'روغن موتور', oilFilter: 'فیلتر روغن', airFilter: 'فیلتر هوا',
    cabinFilter: 'فیلتر کابین', brakePads: 'لنت ترمز', gearboxOil: 'روغن گیربکس',
    gearboxFilter: 'فیلتر گیربکس', batteryReplacement: 'تعویض باتری',
    tirePressure: 'بررسی فشار لاستیک', coolant: 'مایع خنک‌کننده', acGas: 'گاز کولر',
    washerFluid: 'مایع شیشه‌شوی', suspension: 'سیستم تعلیق', timingBelt: 'تسمه تایم',
    exhaust: 'سیستم اگزوز', powerSteeringFluid: 'روغن فرمان',
    addNewCar: 'افزودن خودرو جدید', carName: 'نام خودرو', licensePlate: 'پلاک',
    edit: 'ویرایش', delete: 'حذف', insurance: 'بیمه',
    technicalInspection: 'معاینه فنی', from: 'از', to: 'تا',
    addDates: 'افزودن تاریخ‌ها', expired: 'منقضی شده', daysRemaining: 'روز مانده',
    lightMode: 'حالت روشن', darkMode: 'حالت تاریک', language: 'زبان',
    english: 'English', persian: 'فارسی', settingsDescription: 'مدیریت تنظیمات برنامه',
    phoneNumber: 'شماره تماس', exportReport: 'خروجی گزارش سرویس',
    cost: 'هزینه', mileage: 'کیلومتر', noServices: 'هنوز سرویسی ثبت نشده است',
    noCars: 'هنوز خودرویی اضافه نشده است',
    serviceHistoryDescription: 'مشاهده و خروجی تمام رکوردهای سرویس',
    endOfHistory: 'پایان تاریخچه', serviceItems: 'موارد سرویس', startService: 'شروع',
    insightsSubtitle: 'یاد بگیرید درباره نگهداری و رانندگی ایمن',
    pleaseFillAllFields: 'لطفاً تمام فیلدها را پر کنید',
    savedSuccessfully: 'با موفقیت ذخیره شد!',
    account: 'حساب کاربری',
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Insurance / inspection dates have no column or table in the current DB schema,
// so they cannot be persisted to Supabase without a schema change (which this
// environment cannot apply). They are kept in memory per session and re-merged
// onto freshly loaded car rows. This is the only non-persisted field group.
type CarExtras = Pick<
  Car,
  'insuranceStartDate' | 'insuranceEndDate' | 'technicalInspectionStartDate' | 'technicalInspectionEndDate'
>;
function extractExtras(car: Car): CarExtras {
  const { insuranceStartDate, insuranceEndDate, technicalInspectionStartDate, technicalInspectionEndDate } = car;
  return { insuranceStartDate, insuranceEndDate, technicalInspectionStartDate, technicalInspectionEndDate };
}
function hasExtras(extras: CarExtras): boolean {
  return Object.values(extras).some((v) => v !== undefined);
}

// Tiny id generator for in-memory preview records.
function previewId() {
  return `preview-${Math.random().toString(36).slice(2, 10)}`;
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isPreviewMode } = useAuth();

  const [language, setLanguage] = useState<Language>('fa');
  const [theme, setTheme] = useState<Theme>('light');

  const [cars, setCars] = useState<Car[]>([]);
  const [carsLoading, setCarsLoading] = useState(true);

  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  const [reminders, setReminders] = useState<Reminder[]>([]);

  // ── Load helpers (skipped in preview mode) ──────────────────────────────────

  const loadCars = useCallback(async (): Promise<string[]> => {
    if (isPreviewMode) {
      setCarsLoading(false);
      return cars.map((c) => c.id);
    }
    try {
      const loaded = await carsService.list();
      // Re-apply the session-only insurance/inspection dates onto the fresh rows.
      setCars((prev) => {
        const extrasById = new Map<string, CarExtras>();
        for (const c of prev) {
          const extras = extractExtras(c);
          if (hasExtras(extras)) extrasById.set(c.id, extras);
        }
        return loaded.map((c) => ({ ...c, ...(extrasById.get(c.id) ?? {}) }));
      });
      return loaded.map((c) => c.id);
    } catch {
      setCars([]);
      return [];
    } finally {
      setCarsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPreviewMode]);

  const loadServicesAndReminders = useCallback(async (carIds: string[]) => {
    if (isPreviewMode) {
      setServicesLoading(false);
      return;
    }
    try {
      const [loadedServices, loadedReminders] = await Promise.all([
        servicesService.listByCars(carIds),
        remindersService.listByCars(carIds),
      ]);
      setServices(loadedServices);
      setReminders(loadedReminders);
    } catch {
      // individual services already log details; keep whatever loaded
    } finally {
      setServicesLoading(false);
    }
  }, [isPreviewMode]);

  const loadAll = useCallback(async () => {
    setCarsLoading(true);
    setServicesLoading(true);
    const carIds = await loadCars();
    await loadServicesAndReminders(carIds);
  }, [loadCars, loadServicesAndReminders]);

  // On mount: if preview mode, just clear loading flags immediately.
  // Otherwise wire up the real Supabase auth listener.
  useEffect(() => {
    if (isPreviewMode) {
      setCarsLoading(false);
      setServicesLoading(false);
      return;
    }
    loadAll();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
        loadAll();
      }
    });
    return () => subscription.unsubscribe();
  }, [isPreviewMode, loadAll]);

  // ── Theme / language ─────────────────────────────────────────────────────────

  useEffect(() => {
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // ── Cars ─────────────────────────────────────────────────────────────────────

  const addCar = async (car: Omit<Car, 'id'>): Promise<void> => {
    if (isPreviewMode) {
      setCars((prev) => [...prev, { ...car, id: previewId() }]);
      return;
    }
    await carsService.create(car);
    await loadCars();
  };

  const updateCar = async (id: string, changes: Partial<Car>): Promise<void> => {
    if (isPreviewMode) {
      setCars((prev) => prev.map((c) => (c.id === id ? { ...c, ...changes } : c)));
      return;
    }
    const wrote = await carsService.update(id, changes);
    if (wrote) {
      await loadCars();
    }
    // Merge session-only fields (insurance/inspection dates) either way.
    const sessionOnly = extractExtras(changes as Car);
    if (hasExtras(sessionOnly)) {
      setCars((prev) => prev.map((c) => (c.id === id ? { ...c, ...changes } : c)));
    }
  };

  const deleteCar = async (id: string): Promise<void> => {
    if (isPreviewMode) {
      setCars((prev) => prev.filter((c) => c.id !== id));
      setServices((prev) => prev.filter((s) => s.carId !== id));
      setReminders((prev) => prev.filter((r) => r.carId !== id));
      return;
    }
    await carsService.remove(id);
    await loadAll();
  };

  // ── Services ──────────────────────────────────────────────────────────────────

  const addService = async (service: Omit<Service, 'id'>): Promise<void> => {
    if (isPreviewMode) {
      setServices((prev) => [{ ...service, id: previewId() }, ...prev]);
      return;
    }
    await servicesService.create(service);
    await loadServicesAndReminders(cars.map((c) => c.id));
  };

  const updateService = async (id: string, service: Omit<Service, 'id'>): Promise<void> => {
    if (isPreviewMode) {
      setServices((prev) => prev.map((s) => (s.id === id ? { ...service, id } : s)));
      return;
    }
    await servicesService.update(id, service);
    await loadServicesAndReminders(cars.map((c) => c.id));
  };

  const deleteService = async (id: string): Promise<void> => {
    if (isPreviewMode) {
      setServices((prev) => prev.filter((s) => s.id !== id));
      return;
    }
    await servicesService.remove(id);
    await loadServicesAndReminders(cars.map((c) => c.id));
  };

  // ── Reminders ─────────────────────────────────────────────────────────────────

  const addReminder = async (reminder: Omit<Reminder, 'id'>): Promise<void> => {
    if (isPreviewMode) {
      setReminders((prev) => [{ ...reminder, id: previewId() }, ...prev]);
      return;
    }
    await remindersService.create(reminder);
    await loadServicesAndReminders(cars.map((c) => c.id));
  };

  const deleteReminder = async (id: string): Promise<void> => {
    if (isPreviewMode) {
      setReminders((prev) => prev.filter((r) => r.id !== id));
      return;
    }
    await remindersService.remove(id);
    await loadServicesAndReminders(cars.map((c) => c.id));
  };

  // ── i18n ──────────────────────────────────────────────────────────────────────

  const t = (key: string): string =>
    translations[language][key as keyof typeof translations['en']] || key;

  return (
    <AppContext.Provider
      value={{
        language, setLanguage,
        theme, setTheme,
        cars, carsLoading, addCar, updateCar, deleteCar,
        services, servicesLoading, addService, updateService, deleteService,
        reminders, addReminder, deleteReminder,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error('useApp must be used within an AppProvider');
  return context;
};
