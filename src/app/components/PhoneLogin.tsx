import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Car } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { PrivacyPolicy } from './PrivacyPolicy';

// Google "G" logo SVG
const GoogleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export const PhoneLogin: React.FC = () => {
  const { language } = useApp();
  const { login, previewLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const isRTL = language === 'fa';

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await login();
    } catch {
      setIsLoading(false);
    }
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
            <Car className="w-10 h-10 text-primary-foreground" />
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
              ? 'برای ادامه با حساب گوگل خود وارد شوید'
              : 'Sign in with your Google account to continue'}
          </p>
        </motion.div>

        {/* Google Sign-In Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-[calc(var(--radius)+8px)] bg-card border border-border text-foreground font-semibold shadow-sm hover:bg-muted disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
          >
            {isLoading ? (
              <>
                <motion.div
                  className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
                <span>{isRTL ? 'در حال اتصال...' : 'Connecting...'}</span>
              </>
            ) : (
              <>
                <GoogleIcon className="w-5 h-5 flex-shrink-0" />
                <span>{isRTL ? 'ادامه با گوگل' : 'Continue with Google'}</span>
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Dev-only preview bypass */}
        {previewLogin && (
          <motion.div
            className="mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={previewLogin}
              className="w-full py-3 px-6 rounded-[var(--radius)] border border-dashed border-border text-muted-foreground text-sm hover:text-foreground hover:border-primary/50 transition-colors"
            >
              {isRTL ? '⚡ پیش‌نمایش بدون ورود' : '⚡ Preview without login'}
            </button>
          </motion.div>
        )}

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
                    <button type="button" className="text-primary hover:underline font-medium">
                      سیاست حفظ حریم خصوصی
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[90vh]">
                    <SheetHeader>
                      <SheetTitle className="text-center">سیاست حفظ حریم خصوصی</SheetTitle>
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
                    <button type="button" className="text-primary hover:underline font-medium">
                      Privacy Policy
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[90vh]">
                    <SheetHeader>
                      <SheetTitle className="text-center">Privacy Policy</SheetTitle>
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
