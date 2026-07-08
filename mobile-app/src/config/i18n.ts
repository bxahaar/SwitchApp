import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Translations
const translations = {
  fa: {
    // Auth
    phoneNumber: 'شماره تلفن',
    sendCode: 'ارسال کد',
    verifyCode: 'تایید کد',
    enterOTP: 'کد تایید را وارد کنید',
    resendCode: 'ارسال مجدد کد',
    logout: 'خروج از حساب',
    
    // Dashboard
    dashboard: 'داشبورد',
    myCars: 'خودروهای من',
    upcomingServices: 'سرویس‌های پیش‌رو',
    serviceHistory: 'تاریخچه سرویس‌ها',
    addService: 'افزودن سرویس',
    noServices: 'سرویسی ثبت نشده است',
    noCars: 'هنوز خودرویی ثبت نشده',
    
    // Car
    addCar: 'افزودن خودرو',
    editCar: 'ویرایش خودرو',
    deleteCar: 'حذف خودرو',
    brand: 'برند',
    model: 'مدل',
    year: 'سال ساخت',
    color: 'رنگ',
    licensePlate: 'پلاک',
    currentMileage: 'کیلومتر فعلی',
    
    // Service
    serviceDate: 'تاریخ سرویس',
    serviceCost: 'هزینه سرویس',
    serviceType: 'نوع سرویس',
    serviceProvider: 'تعمیرگاه',
    description: 'توضیحات',
    notes: 'یادداشت‌ها',
    
    // Reminder
    addReminder: 'افزودن یادآوری',
    dueDate: 'تاریخ سررسید',
    dueMileage: 'کیلومتر سررسید',
    markAsDone: 'علامت به عنوان انجام شده',
    deleteReminder: 'حذف یادآوری',
    
    // Common
    save: 'ذخیره',
    cancel: 'انصراف',
    delete: 'حذف',
    edit: 'ویرایش',
    confirm: 'تایید',
    close: 'بستن',
    ok: 'باشه',
    error: 'خطا',
    success: 'موفقیت',
    loading: 'در حال بارگذاری...',
    retry: 'تلاش مجدد',
    
    // Units
    km: 'کیلومتر',
    toman: 'تومان',
    days: 'روز',
    
    // Messages
    successMessage: 'عملیات با موفقیت انجام شد',
    errorMessage: 'خطایی رخ داد',
    networkError: 'خطا در اتصال به اینترنت',
    validationError: 'لطفا تمام فیلدها را پر کنید',
  },
  en: {
    // Auth
    phoneNumber: 'Phone Number',
    sendCode: 'Send Code',
    verifyCode: 'Verify Code',
    enterOTP: 'Enter verification code',
    resendCode: 'Resend Code',
    logout: 'Logout',
    
    // Dashboard
    dashboard: 'Dashboard',
    myCars: 'My Cars',
    upcomingServices: 'Upcoming Services',
    serviceHistory: 'Service History',
    addService: 'Add Service',
    noServices: 'No services yet',
    noCars: 'No cars added yet',
    
    // Car
    addCar: 'Add Car',
    editCar: 'Edit Car',
    deleteCar: 'Delete Car',
    brand: 'Brand',
    model: 'Model',
    year: 'Year',
    color: 'Color',
    licensePlate: 'License Plate',
    currentMileage: 'Current Mileage',
    
    // Service
    serviceDate: 'Service Date',
    serviceCost: 'Service Cost',
    serviceType: 'Service Type',
    serviceProvider: 'Service Provider',
    description: 'Description',
    notes: 'Notes',
    
    // Reminder
    addReminder: 'Add Reminder',
    dueDate: 'Due Date',
    dueMileage: 'Due Mileage',
    markAsDone: 'Mark as Done',
    deleteReminder: 'Delete Reminder',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    confirm: 'Confirm',
    close: 'Close',
    ok: 'OK',
    error: 'Error',
    success: 'Success',
    loading: 'Loading...',
    retry: 'Retry',
    
    // Units
    km: 'km',
    toman: 'Toman',
    days: 'days',
    
    // Messages
    successMessage: 'Operation successful',
    errorMessage: 'An error occurred',
    networkError: 'Network error',
    validationError: 'Please fill all fields',
  },
};

const i18n = new I18n(translations);

// Set the locale
i18n.locale = Localization.locale;
i18n.enableFallback = true;
i18n.defaultLocale = 'fa';

// Initialize i18n with stored language
export async function initializeI18n() {
  try {
    const storedLanguage = await AsyncStorage.getItem('language');
    if (storedLanguage) {
      i18n.locale = storedLanguage;
      
      // Update RTL if needed
      const isRTL = storedLanguage === 'fa';
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.forceRTL(isRTL);
        // Note: Requires app reload to take effect
      }
    }
  } catch (error) {
    console.error('Failed to load language setting:', error);
  }
}

// Change language
export async function changeLanguage(language: 'fa' | 'en') {
  try {
    i18n.locale = language;
    await AsyncStorage.setItem('language', language);
    
    // Update RTL
    const isRTL = language === 'fa';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.forceRTL(isRTL);
      // Show alert to restart app
    }
  } catch (error) {
    console.error('Failed to change language:', error);
  }
}

export default i18n;
