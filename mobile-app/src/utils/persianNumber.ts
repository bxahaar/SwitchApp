/**
 * Persian Number Utilities
 */

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Convert English/Arabic numerals to Persian
 */
export function toPersianNumber(input: string | number): string {
  const str = String(input);
  return str.replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit, 10)]);
}

/**
 * Convert Persian/Arabic numerals to English
 */
export function toEnglishNumber(input: string): string {
  let result = input;
  
  // Persian to English
  persianDigits.forEach((digit, index) => {
    result = result.replace(new RegExp(digit, 'g'), String(index));
  });
  
  // Arabic to English
  arabicDigits.forEach((digit, index) => {
    result = result.replace(new RegExp(digit, 'g'), String(index));
  });
  
  return result;
}

/**
 * Normalize phone number input
 * Converts Persian/Arabic digits to English and formats for API
 */
export function normalizePhoneNumber(input: string): string {
  // Convert to English numbers
  let normalized = toEnglishNumber(input);
  
  // Remove non-digits except +
  normalized = normalized.replace(/[^\d+]/g, '');
  
  // Add +98 if not present
  if (!normalized.startsWith('+')) {
    if (normalized.startsWith('0')) {
      normalized = '+98' + normalized.slice(1);
    } else if (normalized.startsWith('98')) {
      normalized = '+' + normalized;
    } else {
      normalized = '+98' + normalized;
    }
  }
  
  return normalized;
}

/**
 * Format phone number for display
 * Example: +989123456789 -> 0912 345 6789
 */
export function formatPhoneNumber(phone: string, persian = true): string {
  const cleaned = phone.replace(/\D/g, '');
  
  // Remove country code if present
  const local = cleaned.startsWith('98') ? cleaned.slice(2) : cleaned;
  
  // Format: 0912 345 6789
  const formatted = local.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
  
  return persian ? toPersianNumber(formatted) : formatted;
}

/**
 * Parse number input (handles Persian/Arabic/English digits)
 */
export function parseNumber(input: string): number {
  const english = toEnglishNumber(input);
  const parsed = parseFloat(english.replace(/[^\d.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format number with separators
 */
export function formatNumber(num: number, persian = true): string {
  const formatted = new Intl.NumberFormat('en-US').format(num);
  return persian ? toPersianNumber(formatted) : formatted;
}
