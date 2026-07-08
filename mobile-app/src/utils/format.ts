import { toPersianNumber, formatNumber } from './persianNumber';

/**
 * Format price with currency
 */
export function formatPrice(
  amount: number,
  currency: 'toman' | 'rial' = 'toman',
  persian = true
): string {
  const formatted = formatNumber(amount, persian);
  return currency === 'toman' ? `${formatted} تومان` : `${formatted} ریال`;
}

/**
 * Format mileage
 */
export function formatMileage(km: number, persian = true): string {
  const formatted = formatNumber(km, persian);
  return `${formatted} ${persian ? 'کیلومتر' : 'km'}`;
}

/**
 * Format car display name
 */
export function formatCarName(brand: string, model: string, year?: number): string {
  if (year) {
    return `${brand} ${model} (${toPersianNumber(year)})`;
  }
  return `${brand} ${model}`;
}

/**
 * Format license plate
 */
export function formatLicensePlate(plate: string, persian = true): string {
  return persian ? toPersianNumber(plate) : plate;
}

/**
 * Truncate text
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, persian = true): string {
  const formatted = value.toFixed(1);
  return persian ? `٪${toPersianNumber(formatted)}` : `${formatted}%`;
}

/**
 * Format duration
 */
export function formatDuration(days: number, persian = true): string {
  if (days === 0) {
    return persian ? 'امروز' : 'Today';
  } else if (days === 1) {
    return persian ? 'فردا' : 'Tomorrow';
  } else if (days < 30) {
    const formatted = persian ? toPersianNumber(days) : days;
    return persian ? `${formatted} روز` : `${formatted} days`;
  } else if (days < 365) {
    const months = Math.floor(days / 30);
    const formatted = persian ? toPersianNumber(months) : months;
    return persian ? `${formatted} ماه` : `${formatted} months`;
  } else {
    const years = Math.floor(days / 365);
    const formatted = persian ? toPersianNumber(years) : years;
    return persian ? `${formatted} سال` : `${formatted} years`;
  }
}
