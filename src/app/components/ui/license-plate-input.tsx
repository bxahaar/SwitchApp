import React, { useRef, useState, useEffect } from 'react';
import { cn, extractDigits } from './utils';

interface LicensePlateInputProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

// Persian letters allowed on Iranian license plates
const PERSIAN_LETTERS = ['الف', 'ب', 'پ', 'ت', 'ث', 'ج', 'چ', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'ژ', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'و', 'ه', 'ی'];

export const LicensePlateInput: React.FC<LicensePlateInputProps> = ({
  value,
  onChange,
  className,
  disabled = false,
}) => {
  // Parse the license plate value into segments
  const parsePlate = (plate: string): [string, string, string, string] => {
    if (!plate) return ['', '', '', ''];
    
    // Expected format: "12ب345-67" or "12-ب-345-67"
    const cleaned = plate.replace(/[-\s]/g, '');
    
    // Extract parts
    const part1 = cleaned.slice(0, 2); // First 2 digits
    const part2 = cleaned.slice(2, 3); // 1 Persian letter
    const part3 = cleaned.slice(3, 6); // 3 digits
    const part4 = cleaned.slice(6, 8); // 2 digits (city code)
    
    return [part1, part2, part3, part4];
  };

  const [part1, part2, part3, part4] = parsePlate(value);
  
  const input1Ref = useRef<HTMLInputElement>(null);
  const input2Ref = useRef<HTMLInputElement>(null);
  const input3Ref = useRef<HTMLInputElement>(null);
  const input4Ref = useRef<HTMLInputElement>(null);

  const [error, setError] = useState(false);

  const formatPlate = (p1: string, p2: string, p3: string, p4: string): string => {
    // Return formatted plate: "12ب345-67"
    let result = p1;
    if (p2) result += p2;
    if (p3) result += p3;
    if (p4) result += '-' + p4;
    return result;
  };

  const handlePart1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = extractDigits(e.target.value).slice(0, 2);
    onChange(formatPlate(val, part2, part3, part4));
    
    if (val.length === 2) {
      input2Ref.current?.focus();
    }
  };

  const handlePart2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.slice(-1); // Take last character
    
    // Check if it's a valid Persian letter
    if (val && !PERSIAN_LETTERS.includes(val)) {
      setError(true);
      return;
    }
    
    setError(false);
    onChange(formatPlate(part1, val, part3, part4));
    
    if (val.length === 1) {
      input3Ref.current?.focus();
    }
  };

  const handlePart3Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = extractDigits(e.target.value).slice(0, 3);
    onChange(formatPlate(part1, part2, val, part4));
    
    if (val.length === 3) {
      input4Ref.current?.focus();
    }
  };

  const handlePart4Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = extractDigits(e.target.value).slice(0, 2);
    onChange(formatPlate(part1, part2, part3, val));
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    currentPart: number,
    currentValue: string
  ) => {
    if (e.key === 'Backspace' && currentValue === '') {
      e.preventDefault();
      // Move to previous field
      if (currentPart === 2) {
        input1Ref.current?.focus();
        onChange(formatPlate('', '', part3, part4));
      } else if (currentPart === 3) {
        input2Ref.current?.focus();
        onChange(formatPlate(part1, '', part3, part4));
      } else if (currentPart === 4) {
        input3Ref.current?.focus();
        onChange(formatPlate(part1, part2, '', part4));
      }
    }
    
    if (e.key === 'ArrowRight') {
      if (currentPart === 1) input2Ref.current?.focus();
      else if (currentPart === 2) input3Ref.current?.focus();
      else if (currentPart === 3) input4Ref.current?.focus();
    }
    
    if (e.key === 'ArrowLeft') {
      if (currentPart === 2) input1Ref.current?.focus();
      else if (currentPart === 3) input2Ref.current?.focus();
      else if (currentPart === 4) input3Ref.current?.focus();
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Example placeholder */}
      <div className="text-xs text-muted-foreground text-center">
        مثال: ۱۲ ب ۳۴۵ - ۶۷
      </div>
      
      <div className="flex items-center justify-center gap-2 dir-rtl">
        {/* Part 4: City Code (2 digits) */}
        <input
          ref={input4Ref}
          type="text"
          inputMode="numeric"
          value={part4}
          onChange={handlePart4Change}
          onKeyDown={(e) => handleKeyDown(e, 4, part4)}
          disabled={disabled}
          maxLength={2}
          placeholder="۶۷"
          className={cn(
            'w-14 h-12 text-center rounded-xl border bg-secondary text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-all',
            disabled && 'opacity-50 cursor-not-allowed',
            error && 'border-red-500'
          )}
          dir="ltr"
        />
        
        {/* Separator */}
        <span className="text-muted-foreground font-bold">-</span>
        
        {/* Part 3: 3-digit number */}
        <input
          ref={input3Ref}
          type="text"
          inputMode="numeric"
          value={part3}
          onChange={handlePart3Change}
          onKeyDown={(e) => handleKeyDown(e, 3, part3)}
          disabled={disabled}
          maxLength={3}
          placeholder="۳۴۵"
          className={cn(
            'w-16 h-12 text-center rounded-xl border bg-secondary text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-all',
            disabled && 'opacity-50 cursor-not-allowed',
            error && 'border-red-500'
          )}
          dir="ltr"
        />
        
        {/* Part 2: Persian letter */}
        <input
          ref={input2Ref}
          type="text"
          value={part2}
          onChange={handlePart2Change}
          onKeyDown={(e) => handleKeyDown(e, 2, part2)}
          disabled={disabled}
          maxLength={1}
          placeholder="ب"
          className={cn(
            'w-12 h-12 text-center rounded-xl border bg-primary/10 text-foreground font-bold text-lg',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-all',
            disabled && 'opacity-50 cursor-not-allowed',
            error && 'border-red-500 bg-red-50 dark:bg-red-950/20'
          )}
        />
        
        {/* Part 1: 2-digit number */}
        <input
          ref={input1Ref}
          type="text"
          inputMode="numeric"
          value={part1}
          onChange={handlePart1Change}
          onKeyDown={(e) => handleKeyDown(e, 1, part1)}
          disabled={disabled}
          maxLength={2}
          placeholder="۱۲"
          className={cn(
            'w-14 h-12 text-center rounded-xl border bg-secondary text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-all',
            disabled && 'opacity-50 cursor-not-allowed',
            error && 'border-red-500'
          )}
          dir="ltr"
        />
      </div>
      
      {error && (
        <div className="text-xs text-destructive text-center">
          لطفاً یک حرف فارسی معتبر وارد کنید
        </div>
      )}
    </div>
  );
};