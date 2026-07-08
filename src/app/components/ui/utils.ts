import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes Persian and Arabic numerals to English numerals
 * @param value - String containing Persian/Arabic/English numerals
 * @returns String with all numerals normalized to English
 */
export function normalizeNumerals(value: string): string {
  const persianNumerals = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicNumerals = ['٠', '٢', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const englishNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let result = value;
  
  // Replace Persian numerals
  persianNumerals.forEach((persian, index) => {
    result = result.replace(new RegExp(persian, 'g'), englishNumerals[index]);
  });
  
  // Replace Arabic numerals
  arabicNumerals.forEach((arabic, index) => {
    result = result.replace(new RegExp(arabic, 'g'), englishNumerals[index]);
  });
  
  return result;
}

/**
 * Extracts only numeric digits from a string (supports Persian/Arabic numerals)
 * @param value - String to extract digits from
 * @returns String containing only English digits
 */
export function extractDigits(value: string): string {
  const normalized = normalizeNumerals(value);
  return normalized.replace(/\D/g, '');
}