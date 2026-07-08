import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { extractDigits } from './utils';

interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  value?: number | string;
  onChange?: (value: number) => void;
  allowDecimal?: boolean;
}

/**
 * Formats a number with thousand separators
 */
const formatWithSeparators = (value: string, allowDecimal: boolean): string => {
  if (!value) return '';
  
  if (allowDecimal) {
    const parts = value.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.length > 1 ? `${integerPart}.${parts[1]}` : integerPart;
  }
  
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Removes thousand separators and extracts clean number
 */
const cleanNumber = (value: string): string => {
  return value.replace(/,/g, '');
};

/**
 * Numeric input that supports Persian (۰۱۲۳۴۵۶۷۸۹) and Arabic (٠٢٣٤٥٦٧٨٩) numerals
 * Automatically normalizes to English digits before validation and storage
 * Formats with thousand separators for readability
 */
export const NumericInput: React.FC<NumericInputProps> = ({ 
  value, 
  onChange, 
  allowDecimal = false,
  ...props 
}) => {
  const [displayValue, setDisplayValue] = useState('');

  // Update display value when prop value changes
  useEffect(() => {
    if (value === 0 || value === '0' || value === '') {
      setDisplayValue('');
    } else {
      const strValue = String(value);
      setDisplayValue(formatWithSeparators(strValue, allowDecimal));
    }
  }, [value, allowDecimal]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;
    
    // Remove existing separators
    const cleanedValue = cleanNumber(inputValue);
    
    if (allowDecimal) {
      // For decimal numbers, handle both . and Persian/Arabic decimal separators
      // Normalize Persian/Arabic numerals but keep decimal point
      const normalized = cleanedValue
        .replace(/[۰-۹]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1728)) // Persian to English
        .replace(/[٠-٩]/g, (d) => String.fromCharCode(d.charCodeAt(0) - 1632)) // Arabic to English
        .replace(/[^0-9.]/g, ''); // Remove non-numeric except decimal
      
      // Ensure only one decimal point
      const parts = normalized.split('.');
      const formatted = parts.length > 1 
        ? parts[0] + '.' + parts.slice(1).join('') 
        : normalized;
      
      const numValue = parseFloat(formatted) || 0;
      
      // Update display value with separators
      setDisplayValue(formatWithSeparators(formatted, allowDecimal));
      onChange?.(numValue);
    } else {
      // For integers, extract digits only
      const digitsOnly = extractDigits(cleanedValue);
      const numValue = parseInt(digitsOnly) || 0;
      
      // Update display value with separators
      setDisplayValue(formatWithSeparators(digitsOnly, allowDecimal));
      onChange?.(numValue);
    }
  };

  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      value={displayValue}
      onChange={handleChange}
    />
  );
};