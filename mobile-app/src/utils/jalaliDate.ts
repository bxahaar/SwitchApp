import moment from 'moment-jalaali';
import { toPersianNumber } from './persianNumber';

// Configure moment-jalaali
moment.loadPersian({ usePersianDigits: false });

/**
 * Format date to Persian calendar
 */
export function formatPersianDate(
  date: string | Date,
  format: string = 'jD jMMMM jYYYY'
): string {
  const formatted = moment(date).format(format);
  return toPersianNumber(formatted);
}

/**
 * Format date for display (short format)
 */
export function formatShortDate(date: string | Date): string {
  return formatPersianDate(date, 'jD jMMMM');
}

/**
 * Format date for display (full format)
 */
export function formatFullDate(date: string | Date): string {
  return formatPersianDate(date, 'jD jMMMM jYYYY');
}

/**
 * Format date for API (ISO string)
 */
export function formatDateForAPI(date: Date): string {
  return moment(date).format('YYYY-MM-DD');
}

/**
 * Parse ISO date string to Date object
 */
export function parseISODate(dateString: string): Date {
  return moment(dateString).toDate();
}

/**
 * Get relative time (e.g., "2 days ago")
 */
export function getRelativeTime(date: string | Date, persian = true): string {
  const now = moment();
  const target = moment(date);
  const diff = now.diff(target, 'days');
  
  if (diff === 0) {
    return persian ? 'امروز' : 'Today';
  } else if (diff === 1) {
    return persian ? 'دیروز' : 'Yesterday';
  } else if (diff === -1) {
    return persian ? 'فردا' : 'Tomorrow';
  } else if (diff > 0) {
    return persian ? `${toPersianNumber(diff)} روز پیش` : `${diff} days ago`;
  } else {
    return persian ? `${toPersianNumber(Math.abs(diff))} روز دیگر` : `in ${Math.abs(diff)} days`;
  }
}

/**
 * Get days until a future date
 */
export function getDaysUntil(date: string | Date): number {
  const now = moment();
  const target = moment(date);
  return target.diff(now, 'days');
}

/**
 * Check if date is in the past
 */
export function isPast(date: string | Date): boolean {
  return moment(date).isBefore(moment());
}

/**
 * Check if date is in the future
 */
export function isFuture(date: string | Date): boolean {
  return moment(date).isAfter(moment());
}

/**
 * Get Persian month name
 */
export function getPersianMonth(monthNumber: number): string {
  const months = [
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
    'اسفند',
  ];
  return months[monthNumber - 1] || '';
}

/**
 * Get current Jalali date
 */
export function getCurrentJalaliDate(): {
  year: number;
  month: number;
  day: number;
  formatted: string;
} {
  const now = moment();
  return {
    year: now.jYear(),
    month: now.jMonth() + 1,
    day: now.jDate(),
    formatted: formatFullDate(now.toDate()),
  };
}
