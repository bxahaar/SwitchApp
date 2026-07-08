import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { Smartphone } from 'lucide-react';
import { normalizeNumerals } from './ui/utils';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { PrivacyPolicy } from './PrivacyPolicy';

interface PhoneLoginProps {
  onContinue: (phone: string) => void;
}

export const PhoneLogin: React.FC<PhoneLoginProps> = ({ onContinue }) => {
  const { language } = useApp();
  const [phone, setPhone] = useState('');
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const isRTL = language === 'fa';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) {
      onContinue(phone);
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Normalize Persian/Arabic numerals to English
    const normalized = normalizeNumerals(value);
    // Remove non-digits
    const digits = normalized.replace(/\D/g, '');
    // Limit to 11 digits for Iranian numbers
    return digits.slice(0, 11);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Icon */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
            <Smartphone className="w-10 h-10 text-primary-foreground" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className="text-foreground font-bold mb-2">
            {isRTL ? 'ورود به حساب کاربری' : 'Login to Your Account'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL 
              ? 'لطفاً شماره موبایل خود را وارد کنید'
              : 'Please enter your phone number'
            }
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {/* Phone Input */}
          <div>
            <label className="block text-foreground font-medium mb-3">
              {isRTL ? 'شماره موبایل' : 'Phone Number'}
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
              placeholder={isRTL ? '۰۹۱۲۳۴۵۶۷۸۹' : '09123456789'}
              className="w-full px-6 py-4 rounded-[calc(var(--radius)+8px)] bg-input-background border-2 border-transparent focus:border-primary focus:outline-none text-foreground text-lg text-center transition-all"
              dir="ltr"
              inputMode="numeric"
            />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {isRTL
                ? 'کد تأیید به این شماره ارسال خواهد شد'
                : 'A verification code will be sent to this number'
              }
            </p>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={phone.length < 10}
            className="w-full py-4 rounded-[calc(var(--radius)+8px)] bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            whileTap={{ scale: phone.length >= 10 ? 0.98 : 1 }}
          >
            {isRTL ? 'دریافت کد تأیید' : 'Get Verification Code'}
          </motion.button>
        </motion.form>

        {/* Footer */}
        <motion.div
          className="text-center mt-8 space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-sm text-muted-foreground">
            {isRTL ? (
              <>
                با ورود، با{' '}
                <Sheet open={privacyOpen} onOpenChange={setPrivacyOpen}>
                  <SheetTrigger asChild>
                    <button 
                      type="button"
                      className="text-primary hover:underline font-medium"
                    >
                      سیاست حفظ حریم خصوصی
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[90vh]">
                    <SheetHeader>
                      <SheetTitle className="text-center">
                        سیاست حفظ حریم خصوصی
                      </SheetTitle>
                      <SheetDescription className="text-center">
                        اطلاعات مربوط به حفظ حریم خصوصی و نحوه استفاده از داده‌های شما
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-4 h-[calc(100%-4rem)] overflow-hidden">
                      <PrivacyPolicy />
                    </div>
                  </SheetContent>
                </Sheet>
                {' '}ما موافقت می‌کنید
              </>
            ) : (
              <>
                By continuing, you agree to our{' '}
                <Sheet open={privacyOpen} onOpenChange={setPrivacyOpen}>
                  <SheetTrigger asChild>
                    <button 
                      type="button"
                      className="text-primary hover:underline font-medium"
                    >
                      Privacy Policy
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[90vh]">
                    <SheetHeader>
                      <SheetTitle className="text-center">
                        Privacy Policy
                      </SheetTitle>
                      <SheetDescription className="text-center">
                        Information about how we handle and protect your data
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-4 h-[calc(100%-4rem)] overflow-hidden">
                      <PrivacyPolicy />
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            )}
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};