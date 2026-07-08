import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import { normalizeNumerals } from './ui/utils';

interface OTPVerificationProps {
  phoneNumber: string;
  onVerify: () => void;
  onBack: () => void;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({ phoneNumber, onVerify, onBack }) => {
  const { language } = useApp();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isRTL = language === 'fa';

  useEffect(() => {
    // Auto focus first input
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Normalize Persian/Arabic numerals to English
    const normalized = normalizeNumerals(value);
    
    // Only allow digits
    if (!/^\d*$/.test(normalized)) return;

    const newOtp = [...otp];
    newOtp[index] = normalized.slice(-1); // Only take last character
    setOtp(newOtp);

    // Auto focus next input
    if (normalized && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    // Normalize Persian/Arabic numerals before extracting digits
    const normalized = normalizeNumerals(e.clipboardData.getData('text'));
    const pastedData = normalized.replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus last filled input or next empty
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) return;

    setIsVerifying(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Accept any 6-digit code for demo (in production, verify with backend)
    if (code.length === 6) {
      toast.success(isRTL ? 'ورود موفقیت‌آمیز!' : 'Login successful!');
      onVerify();
    } else {
      toast.error(isRTL ? 'کد نادرست است' : 'Invalid code');
      setIsVerifying(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  useEffect(() => {
    if (otp.every(digit => digit !== '')) {
      handleVerify();
    }
  }, [otp]);

  const formatPhoneNumber = (phone: string) => {
    if (isRTL && phone.startsWith('09')) {
      // Convert to Persian numerals
      const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
      return phone.split('').map(d => persianDigits[parseInt(d)] || d).join('');
    }
    return phone;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Back Button */}
        <motion.button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          <span>{isRTL ? 'بازگشت' : 'Back'}</span>
        </motion.button>

        {/* Icon */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
            <Check className="w-10 h-10 text-primary-foreground" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-foreground font-bold mb-2">
            {isRTL ? 'کد تأیید را وارد کنید' : 'Enter Verification Code'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL 
              ? `کد ۶ رقمی به ${formatPhoneNumber(phoneNumber)} ارسال شد`
              : `6-digit code sent to ${phoneNumber}`
            }
          </p>
        </motion.div>

        {/* OTP Input */}
        <motion.div
          className="flex gap-3 justify-center mb-8"
          dir="ltr"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-14 h-16 rounded-[calc(var(--radius)+8px)] bg-input-background border-2 border-transparent focus:border-primary focus:outline-none text-foreground text-2xl font-semibold text-center transition-all"
              disabled={isVerifying}
            />
          ))}
        </motion.div>

        {/* Loading State */}
        {isVerifying && (
          <motion.div
            className="flex items-center justify-center gap-2 text-primary mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
            <motion.div
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            />
          </motion.div>
        )}

        {/* Resend Code */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-muted-foreground text-sm mb-2">
            {isRTL ? 'کد را دریافت نکردید؟' : "Didn't receive the code?"}
          </p>
          <button 
            className="text-primary font-semibold text-sm hover:underline"
            onClick={() => {
              toast.success(isRTL ? 'کد مجدداً ارسال شد' : 'Code resent');
            }}
          >
            {isRTL ? 'ارسال مجدد' : 'Resend Code'}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};