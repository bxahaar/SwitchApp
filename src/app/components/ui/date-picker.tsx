import React, { useState, useEffect } from 'react';
import * as jalaali from 'jalaali-js';
import { Input } from './input';
import { toPersianNumber } from '../../utils/dateFormatter';
import { Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';

interface DatePickerInputProps {
  value: string; // ISO date string (YYYY-MM-DD)
  onChange: (value: string) => void;
  language: 'en' | 'fa';
  className?: string;
}

export const DatePickerInput: React.FC<DatePickerInputProps> = ({
  value,
  onChange,
  language,
  className
}) => {
  const [open, setOpen] = useState(false);

  // Convert ISO date to calendar date format
  const isoToCalendarDate = (isoDate: string) => {
    if (!isoDate) {
      const today = new Date();
      return {
        year: today.getFullYear(),
        month: today.getMonth() + 1,
        day: today.getDate()
      };
    }
    
    const date = new Date(isoDate);
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  };

  const gregorianDate = isoToCalendarDate(value);
  const [selectedJalali, setSelectedJalali] = useState(() => {
    if (language === 'fa') {
      return jalaali.toJalaali(gregorianDate.year, gregorianDate.month, gregorianDate.day);
    }
    return { jy: gregorianDate.year, jm: gregorianDate.month, jd: gregorianDate.day };
  });

  // Update when value or language changes
  useEffect(() => {
    const greg = isoToCalendarDate(value);
    if (language === 'fa') {
      setSelectedJalali(jalaali.toJalaali(greg.year, greg.month, greg.day));
    } else {
      setSelectedJalali({ jy: greg.year, jm: greg.month, jd: greg.day });
    }
  }, [value, language]);

  // Format display value
  const getDisplayValue = () => {
    if (!value) return '';
    
    if (language === 'fa') {
      const persianMonths = [
        'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
        'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
      ];
      
      return `${toPersianNumber(selectedJalali.jd)} ${persianMonths[selectedJalali.jm - 1]} ${toPersianNumber(selectedJalali.jy)}`;
    } else {
      const date = new Date(value);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }
  };

  const handleDateSelect = (year: number, month: number, day: number) => {
    if (language === 'fa') {
      // Convert Jalali to Gregorian
      const gregorian = jalaali.toGregorian(year, month, day);
      // Format directly as ISO string to avoid timezone conversion issues
      const isoDate = `${gregorian.gy}-${String(gregorian.gm).padStart(2, '0')}-${String(gregorian.gd).padStart(2, '0')}`;
      onChange(isoDate);
      setSelectedJalali({ jy: year, jm: month, jd: day });
    } else {
      // Format directly as ISO string to avoid timezone conversion issues
      const isoDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      onChange(isoDate);
    }
    setOpen(false);
  };

  const PersianCalendar = () => {
    const [viewYear, setViewYear] = useState(selectedJalali.jy);
    const [viewMonth, setViewMonth] = useState(selectedJalali.jm);

    const persianMonths = [
      'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];

    const persianWeekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

    // Get days in Persian month
    const getDaysInMonth = (year: number, month: number) => {
      if (month <= 6) return 31;
      if (month <= 11) return 30;
      return jalaali.isLeapJalaaliYear(year) ? 30 : 29;
    };

    // Get first day of month (0 = Saturday in Persian calendar)
    const getFirstDayOfMonth = (year: number, month: number) => {
      const greg = jalaali.toGregorian(year, month, 1);
      const date = new Date(greg.gy, greg.gm - 1, greg.gd);
      // Convert to Persian week (Saturday = 0)
      return (date.getDay() + 1) % 7;
    };

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDay }, (_, i) => i);

    return (
      <div className="p-4 w-80" dir="rtl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (viewMonth === 1) {
                setViewMonth(12);
                setViewYear(viewYear - 1);
              } else {
                setViewMonth(viewMonth - 1);
              }
            }}
          >
            →
          </Button>
          <div className="text-center">
            <div className="font-medium">{persianMonths[viewMonth - 1]} {toPersianNumber(viewYear)}</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (viewMonth === 12) {
                setViewMonth(1);
                setViewYear(viewYear + 1);
              } else {
                setViewMonth(viewMonth + 1);
              }
            }}
          >
            ←
          </Button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {persianWeekDays.map((day, i) => (
            <div key={i} className="text-center text-xs font-medium text-muted-foreground p-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} className="p-2" />
          ))}
          {days.map((day) => {
            const isSelected = day === selectedJalali.jd && viewMonth === selectedJalali.jm && viewYear === selectedJalali.jy;
            const isToday = (() => {
              const today = new Date();
              const todayJalali = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());
              return day === todayJalali.jd && viewMonth === todayJalali.jm && viewYear === todayJalali.jy;
            })();

            return (
              <button
                key={day}
                onClick={() => handleDateSelect(viewYear, viewMonth, day)}
                className={`
                  p-2 text-sm rounded-lg transition-colors
                  ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}
                  ${isToday && !isSelected ? 'border border-primary' : ''}
                `}
              >
                {toPersianNumber(day)}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (language === 'fa') {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-[330px] justify-start text-right font-normal ${className}`}
          >
            <Calendar className="ml-2 h-4 w-4" />
            {getDisplayValue() || 'انتخاب تاریخ'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <PersianCalendar />
        </PopoverContent>
      </Popover>
    );
  }

  // For English, use native date input
  return (
    <Input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    />
  );
};