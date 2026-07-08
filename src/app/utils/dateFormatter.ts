import * as jalaali from 'jalaali-js';

// Persian month names
const persianMonths = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند'
];

// Convert Western numerals to Persian numerals
export const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
};

// Format date in Persian (Shamsi/Jalali)
export const formatPersianDate = (dateString: string): string => {
  const date = new Date(dateString);
  const gregorian = {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()
  };
  
  const jalali = jalaali.toJalaali(gregorian.year, gregorian.month, gregorian.day);
  
  const day = toPersianNumber(jalali.jd);
  const month = persianMonths[jalali.jm - 1];
  const year = toPersianNumber(jalali.jy);
  
  return `${day} ${month} ${year}`;
};

// Format date in English
export const formatEnglishDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Format date based on language
export const formatDate = (dateString: string, language: 'en' | 'fa'): string => {
  return language === 'fa' ? formatPersianDate(dateString) : formatEnglishDate(dateString);
};
