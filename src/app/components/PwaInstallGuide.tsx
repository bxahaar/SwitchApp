import React, { useEffect, useMemo, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

const VISIT_COUNT_KEY = 'switchapp:pwa-install-browser-visits';
const INSTALLED_KEY = 'switchapp:pwa-installed';
const SKIPPED_VISIT_KEY = 'switchapp:pwa-install-skipped-at';

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export const PwaInstallGuide: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [standalone, setStandalone] = useState(() => isStandalone());

  const isIos = useMemo(() => /iphone|ipad|ipod/i.test(window.navigator.userAgent), []);

  useEffect(() => {
    if (standalone) {
      localStorage.setItem(INSTALLED_KEY, 'true');
      setVisible(false);
      return;
    }

    if (localStorage.getItem(INSTALLED_KEY) === 'true') return;

    const visits = Number(localStorage.getItem(VISIT_COUNT_KEY) || '0') + 1;
    const skippedAt = Number(localStorage.getItem(SKIPPED_VISIT_KEY) || '0');
    localStorage.setItem(VISIT_COUNT_KEY, String(visits));

    if (!skippedAt || visits - skippedAt >= 5) {
      setVisible(true);
    }
  }, [standalone]);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
      if (!isStandalone() && localStorage.getItem(INSTALLED_KEY) !== 'true') {
        setVisible(true);
      }
    };

    const onInstalled = () => {
      localStorage.setItem(INSTALLED_KEY, 'true');
      setStandalone(true);
      setVisible(false);
    };

    const standaloneQuery = window.matchMedia('(display-mode: standalone)');
    const onDisplayModeChange = () => setStandalone(isStandalone());

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    standaloneQuery.addEventListener('change', onDisplayModeChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      standaloneQuery.removeEventListener('change', onDisplayModeChange);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);

    if (choice.outcome === 'accepted') {
      localStorage.setItem(INSTALLED_KEY, 'true');
      setVisible(false);
    }
  };

  const handleSkip = () => {
    const visits = Number(localStorage.getItem(VISIT_COUNT_KEY) || '1');
    localStorage.setItem(SKIPPED_VISIT_KEY, String(visits));
    setVisible(false);
  };

  if (!visible || standalone) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 safe-area-bottom" dir="rtl" role="dialog" aria-modal="true" aria-labelledby="pwa-install-title">
      <div className="w-full max-w-[440px] rounded-[28px] border border-border/70 bg-card p-5 text-card-foreground shadow-2xl">
        <div className="space-y-3 text-right">
          <p id="pwa-install-title" className="text-lg font-semibold">نصب اپلیکیشن SwitchApp</p>
          <p className="text-sm leading-7 text-muted-foreground">
            برای تجربه‌ای شبیه اپلیکیشن موبایل، SwitchApp را به صفحه اصلی گوشی اضافه کنید. بعد از نصب، برنامه تمام‌صفحه و بدون نوار مرورگر باز می‌شود.
          </p>
          {isIos && !installPrompt && (
            <p className="rounded-2xl bg-secondary p-3 text-xs leading-6 text-muted-foreground">
              در Safari روی دکمه Share بزنید و گزینه Add to Home Screen را انتخاب کنید.
            </p>
          )}
        </div>
        <div className="mt-5 grid grid-cols-1 gap-2">
          {installPrompt && (
            <button onClick={handleInstall} className="min-h-12 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition active:scale-[0.98]">
              نصب / افزودن به صفحه اصلی
            </button>
          )}
          <button onClick={handleSkip} className="min-h-12 rounded-2xl bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground transition active:scale-[0.98]">
            فعلاً نه
          </button>
        </div>
      </div>
    </div>
  );
};
