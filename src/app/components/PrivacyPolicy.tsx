import React from 'react';
import { useApp } from '../context/AppContext';
import { Shield, Lock, Database, Eye, FileText, Users } from 'lucide-react';

export const PrivacyPolicy: React.FC = () => {
  const { language } = useApp();
  const isRTL = language === 'fa';

  const sections = isRTL ? [
    {
      icon: Shield,
      title: 'معرفی',
      content: 'این برنامه برای کمک به شما در مدیریت و ردیابی سرویس‌های خودروی خود طراحی شده است. ما به حریم خصوصی شما احترام می‌گذاریم و متعهد به محافظت از اطلاعات شخصی شما هستیم.'
    },
    {
      icon: Database,
      title: 'اطلاعاتی که جمع‌آوری می‌کنیم',
      content: 'ما اطلاعات زیر را جمع‌آوری می‌کنیم:\n• شماره تلفن شما برای احراز هویت\n• اطلاعات خودرو (نام، پلاک)\n• سوابق سرویس (تاریخ، کارکرد، هزینه، یادداشت‌ها)\n• تنظیمات برنامه (زبان، تم)'
    },
    {
      icon: Lock,
      title: 'نحوه استفاده از اطلاعات شما',
      content: 'اطلاعات شما برای موارد زیر استفاده می‌شود:\n• ارائه و بهبود خدمات برنامه\n• احراز هویت و احراز هویت کاربر\n• ذخیره و نمایش سوابق سرویس خودروی شما\n• ارسال یادآوری‌های سرویس'
    },
    {
      icon: Eye,
      title: 'ذخیره‌سازی و امنیت داده',
      content: 'تمام داده‌های شما به صورت محلی در دستگاه شما ذخیره می‌شود. ما از اقدامات امنیتی مناسب برای محافظت از اطلاعات شما در برابر دسترسی، تغییر یا افشای غیرمجاز استفاده می‌کنیم.'
    },
    {
      icon: Users,
      title: 'اشتراک‌گذاری داده‌ها',
      content: 'ما اطلاعات شخصی شما را با اشخاص ثالث به اشتراک نمی‌گذاریم، نمی‌فروشیم یا اجاره نمی‌دهیم. داده‌های شما به صورت خصوصی در دستگاه شما باقی می‌ماند.'
    },
    {
      icon: FileText,
      title: 'حقوق شما',
      content: 'شما حق دارید:\n• به داده‌های شخصی خود دسترسی داشته باشید و آن‌ها را به‌روز کنید\n• داده‌های خود را حذف کنید\n• صادرات سوابق سرویس خود\n• استفاده از برنامه را در هر زمان متوقف کنید'
    }
  ] : [
    {
      icon: Shield,
      title: 'Introduction',
      content: 'This app is designed to help you manage and track your car services. We respect your privacy and are committed to protecting your personal information.'
    },
    {
      icon: Database,
      title: 'Information We Collect',
      content: 'We collect the following information:\n• Your phone number for authentication\n• Vehicle information (name, license plate)\n• Service records (date, mileage, cost, notes)\n• App preferences (language, theme)'
    },
    {
      icon: Lock,
      title: 'How We Use Your Information',
      content: 'Your information is used to:\n• Provide and improve the app services\n• Authenticate and verify users\n• Store and display your car service records\n• Send service reminders'
    },
    {
      icon: Eye,
      title: 'Data Storage and Security',
      content: 'All your data is stored locally on your device. We use appropriate security measures to protect your information from unauthorized access, alteration, or disclosure.'
    },
    {
      icon: Users,
      title: 'Data Sharing',
      content: 'We do not share, sell, or rent your personal information to third parties. Your data remains private on your device.'
    },
    {
      icon: FileText,
      title: 'Your Rights',
      content: 'You have the right to:\n• Access and update your personal data\n• Delete your data\n• Export your service records\n• Stop using the app at any time'
    }
  ];

  return (
    <div className="h-full overflow-y-auto bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="px-6 py-8 pb-24 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-[calc(var(--radius)+8px)] bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-foreground font-bold">
              {isRTL ? 'سیاست حفظ حریم خصوصی' : 'Privacy Policy'}
            </h1>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            {isRTL 
              ? 'آخرین به‌روزرسانی: دی ۱۴۰۴'
              : 'Last updated: January 2026'
            }
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <div 
              key={index}
              className="rounded-[calc(var(--radius)+8px)] bg-card border border-border/70 p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <section.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-foreground font-semibold mb-3">
                    {section.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-8 p-6 rounded-[calc(var(--radius)+8px)] bg-secondary/70 border border-border/70">
          <h3 className="text-foreground font-semibold mb-2">
            {isRTL ? 'تماس با ما' : 'Contact Us'}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {isRTL
              ? 'اگر سؤال یا نگرانی در مورد این سیاست حفظ حریم خصوصی دارید، لطفاً با ما تماس بگیرید.'
              : 'If you have any questions or concerns about this Privacy Policy, please contact us.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};
