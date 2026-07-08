import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'fa';
export type Theme = 'light' | 'dark';

export interface Car {
  id: string;
  name: string;
  licensePlate: string;
  insuranceStartDate?: string;
  insuranceEndDate?: string;
  technicalInspectionStartDate?: string;
  technicalInspectionEndDate?: string;
}

export interface Service {
  id: string;
  carId: string;
  type: 'engine' | 'gearbox' | 'brakes' | 'tires' | 'battery' | 'general';
  date: string;
  mileage: number;
  cost: number;
  notes: string;
  serviceItems?: string[];
  nextServiceType?: 'date' | 'mileage';
  nextServiceValue?: string | number;
  reminderNote?: string;
}

export interface Reminder {
  id: string;
  carId: string;
  type: 'engine' | 'gearbox' | 'brakes' | 'tires' | 'battery' | 'general';
  reminderType: 'date' | 'mileage';
  reminderValue: string | number;
  reminderNote?: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  cars: Car[];
  addCar: (car: Omit<Car, 'id'>) => void;
  updateCar: (id: string, car: Partial<Car>) => void;
  deleteCar: (id: string) => void;
  services: Service[];
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, service: Omit<Service, 'id'>) => void;
  deleteService: (id: string) => void;
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  deleteReminder: (id: string) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    addService: 'Add Service',
    cars: 'Cars',
    insights: 'Insights',
    
    // Dashboard
    profile: 'Profile',
    settings: 'Settings',
    manageCars: 'Manage Cars',
    upcomingServices: 'Upcoming Services',
    serviceHistory: 'Service History',
    viewAll: 'View All',
    at: 'At',
    in: 'In',
    km: 'km',
    days: 'days',
    
    // Service Types
    engine: 'Engine',
    gearbox: 'Gearbox',
    brakes: 'Brakes',
    tires: 'Tires',
    battery: 'Battery',
    general: 'General',
    
    // Add Service
    selectCar: 'Select Car',
    selectServiceType: 'Select Service Type',
    serviceDate: 'Service Date',
    carMileage: 'Car Mileage (km)',
    serviceCost: 'Service Cost',
    notes: 'Notes / Description',
    nextServiceReminder: 'Next Service Reminder',
    reminderType: 'Reminder Type',
    byDate: 'By Date',
    byMileage: 'By Kilometers',
    reminderNote: 'Reminder Note (Optional)',
    save: 'Save',
    cancel: 'Cancel',
    nextStep: 'Next Step',
    skipReminder: 'Skip Reminder',
    recordCompletedService: 'Record Completed Service',
    recordReminderOnly: 'Only Record Reminder',
    
    // Service Items
    selectServiceItems: 'Select Service Items',
    serviceItemsOptional: 'Select what was serviced (Optional)',
    addCustomItem: 'Add Custom Item',
    customItemPlaceholder: 'Enter custom service item',
    skipItems: 'Skip',
    
    // Predefined Service Items
    engineOil: 'Engine Oil',
    oilFilter: 'Oil Filter',
    airFilter: 'Air Filter',
    cabinFilter: 'Cabin Filter',
    brakePads: 'Brake Pads',
    gearboxOil: 'Gearbox Oil',
    gearboxFilter: 'Gearbox Filter',
    batteryReplacement: 'Battery Replacement',
    tirePressure: 'Tire Pressure Check',
    coolant: 'Coolant',
    acGas: 'AC Gas',
    washerFluid: 'Washer Fluid',
    suspension: 'Suspension',
    timingBelt: 'Timing Belt',
    exhaust: 'Exhaust System',
    powerSteeringFluid: 'Power Steering Fluid',
    
    // Car Management
    addNewCar: 'Add New Car',
    carName: 'Car Name',
    licensePlate: 'License Plate',
    edit: 'Edit',
    delete: 'Delete',
    insurance: 'Insurance',
    technicalInspection: 'Technical Inspection',
    from: 'From',
    to: 'To',
    addDates: 'Add Dates',
    expired: 'Expired',
    daysRemaining: 'days remaining',
    
    // Settings
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    language: 'Language',
    english: 'English',
    persian: 'فارسی',
    settingsDescription: 'Manage your app preferences',
    phoneNumber: 'Phone Number',
    
    // Service History
    exportReport: 'Export Service Report',
    cost: 'Cost',
    mileage: 'Mileage',
    noServices: 'No services recorded yet',
    noCars: 'No cars added yet',
    serviceHistoryDescription: 'View and export all your service records',
    endOfHistory: 'End of History',
    serviceItems: 'Service Items',
    startService: 'Start',
    
    // Education Insights
    insightsSubtitle: 'Learn about car maintenance and safe driving',
  },
  fa: {
    // Navigation
    dashboard: 'داشبورد',
    addService: 'افزودن سرویس',
    cars: 'خودروها',
    insights: 'آموزش',
    
    // Dashboard
    profile: 'پروفایل',
    settings: 'تنظیمات',
    manageCars: 'مدیریت خودروها',
    upcomingServices: 'سرویس‌های پیش‌رو',
    serviceHistory: 'تاریخچه سرویس',
    viewAll: 'مشاهده همه',
    at: 'در',
    in: 'در',
    km: 'کیلومتر',
    days: 'روز',
    
    // Service Types
    engine: 'موتور',
    gearbox: 'گیربکس',
    brakes: 'ترمز',
    tires: 'لاستیک',
    battery: 'باتری',
    general: 'عمومی',
    
    // Add Service
    selectCar: 'انتخاب خودرو',
    selectServiceType: 'انتخاب نوع سرویس',
    serviceDate: 'تاریخ سرویس',
    carMileage: 'کیلومتر خودرو',
    serviceCost: 'هزینه سرویس',
    notes: 'یادداشت / توضیحات',
    nextServiceReminder: 'یادآوری سرویس بعدی',
    reminderType: 'نوع یادآوری',
    byDate: 'بر اساس تاریخ',
    byMileage: 'بر اساس کیلومتر',
    reminderNote: 'یادداشت یادآوری (اختیاری)',
    save: 'ذخیره',
    cancel: 'لغو',
    nextStep: 'مرحله بعد',
    skipReminder: 'رد کردن یادآوری',
    recordCompletedService: 'ثبت سرویس انجام‌شده',
    recordReminderOnly: 'فقط ثبت یادآوری',
    
    // Service Items
    selectServiceItems: 'انتخاب موارد سرویس',
    serviceItemsOptional: 'انتخاب موارد سرویس شده (اختیاری)',
    addCustomItem: 'افزودن مورد سفارشی',
    customItemPlaceholder: 'مورد سفارشی خود را وارد کنید',
    skipItems: 'رد کردن',
    
    // Predefined Service Items
    engineOil: 'روغن موتور',
    oilFilter: 'فیلتر روغن',
    airFilter: 'فیلتر هوا',
    cabinFilter: 'فیلتر کابین',
    brakePads: 'لنت ترمز',
    gearboxOil: 'روغن گیربکس',
    gearboxFilter: 'فیلتر گیربکس',
    batteryReplacement: 'تعویض باتری',
    tirePressure: 'بررسی فشار لاستیک',
    coolant: 'مایع خنک‌کننده',
    acGas: 'گاز کولر',
    washerFluid: 'مایع شیشه‌شوی',
    suspension: 'سیستم تعلیق',
    timingBelt: 'تسمه تایم',
    exhaust: 'سیستم اگزوز',
    powerSteeringFluid: 'روغن فرمان',
    
    // Car Management
    addNewCar: 'افزودن خودرو جدید',
    carName: 'نام خودرو',
    licensePlate: 'پلاک',
    edit: 'ویرایش',
    delete: 'حذف',
    insurance: 'بیمه',
    technicalInspection: 'معاینه فنی',
    from: 'از',
    to: 'تا',
    addDates: 'افزودن تاریخ‌ها',
    expired: 'منقضی شده',
    daysRemaining: 'روز مانده',
    
    // Settings
    lightMode: 'حالت روشن',
    darkMode: 'حالت تاریک',
    language: 'زبان',
    english: 'English',
    persian: 'فارسی',
    settingsDescription: 'مدیریت تنظیمات برنامه',
    phoneNumber: 'شماره تماس',
    
    // Service History
    exportReport: 'خروجی گزارش سرویس',
    cost: 'هزینه',
    mileage: 'کیلومتر',
    noServices: 'هنوز سرویسی ثبت نشده است',
    noCars: 'هنوز خودرویی اضافه نشده است',
    serviceHistoryDescription: 'مشاهده و خروجی تمام رکوردهای سرویس',
    endOfHistory: 'پایان تاریخچه',
    serviceItems: 'موارد سرویس',
    startService: 'شروع',
    
    // Education Insights
    insightsSubtitle: 'یاد بگیرید درباره نگهداری و رانندگی ایمن',
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fa');
  const [theme, setTheme] = useState<Theme>('light');
  const [cars, setCars] = useState<Car[]>([
    { 
      id: '1', 
      name: 'Toyota Camry 2020', 
      licensePlate: '12A34567',
      insuranceStartDate: '2024-06-01',
      insuranceEndDate: '2025-06-01',
      technicalInspectionStartDate: '2024-11-01',
      technicalInspectionEndDate: '2025-01-15',
    },
    { 
      id: '2', 
      name: 'Honda Civic 2019', 
      licensePlate: '56B78901',
      insuranceStartDate: '2023-03-15',
      insuranceEndDate: '2024-03-15',
    },
  ]);
  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      carId: '1',
      type: 'brakes',
      date: '2023-09-10',
      mileage: 40100,
      cost: 45.00,
      notes: 'Wiper Replacement',
      nextServiceType: 'mileage',
      nextServiceValue: 140000,
    },
    {
      id: '2',
      carId: '1',
      type: 'general',
      date: '2023-01-15',
      mileage: 35000,
      cost: 120.00,
      notes: 'General Inspection',
    },
    {
      id: '3',
      carId: '2',
      type: 'engine',
      date: '2024-12-01',
      mileage: 95000,
      cost: 350,
      notes: 'Oil change and filter replacement',
      nextServiceType: 'date',
      nextServiceValue: '2025-02-01',
    },
  ]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const addCar = (car: Omit<Car, 'id'>) => {
    const newCar = { ...car, id: Date.now().toString() };
    setCars([...cars, newCar]);
  };

  const updateCar = (id: string, updatedCar: Partial<Car>) => {
    setCars(cars.map(car => car.id === id ? { ...car, ...updatedCar } : car));
  };

  const deleteCar = (id: string) => {
    setCars(cars.filter(car => car.id !== id));
  };

  const addService = (service: Omit<Service, 'id'>) => {
    const newService = { ...service, id: Date.now().toString() };
    setServices([newService, ...services]);
  };

  const updateService = (id: string, updatedService: Omit<Service, 'id'>) => {
    setServices(services.map(service => service.id === id ? { ...service, ...updatedService } : service));
  };

  const deleteService = (id: string) => {
    setServices(services.filter(service => service.id !== id));
  };

  const addReminder = (reminder: Omit<Reminder, 'id'>) => {
    const newReminder = { ...reminder, id: Date.now().toString() };
    setReminders([newReminder, ...reminders]);
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        setTheme,
        cars,
        addCar,
        updateCar,
        deleteCar,
        services,
        addService,
        updateService,
        deleteService,
        reminders,
        addReminder,
        deleteReminder,
        t,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
