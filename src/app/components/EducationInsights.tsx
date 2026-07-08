import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Droplet, Gauge, AlertCircle, Shield, Wrench, Battery, Zap, ThermometerSun } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface InsightCard {
  id: string;
  titleEn: string;
  titleFa: string;
  category: string;
  categoryEn: string;
  categoryFa: string;
  icon: React.ComponentType<{ className?: string }>;
  bgColor: string;
  imageUrl: string;
  slides: {
    titleEn: string;
    titleFa: string;
    contentEn: string;
    contentFa: string;
  }[];
}

const insightCards: InsightCard[] = [
  {
    id: '1',
    titleEn: 'Check Engine Oil',
    titleFa: 'بررسی روغن موتور',
    category: 'maintenance',
    categoryEn: 'Maintenance',
    categoryFa: 'نگهداری',
    icon: Droplet,
    bgColor: 'bg-gradient-to-br from-pink-200 to-pink-300',
    imageUrl: 'https://images.unsplash.com/photo-1581418412893-7bd90746381d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbmdpbmUlMjBvaWwlMjBjaGVja3xlbnwxfHx8fDE3NjY5MzM5MzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    slides: [
      {
        titleEn: 'Why Check Oil?',
        titleFa: 'چرا روغن را چک کنیم؟',
        contentEn: 'Engine oil lubricates moving parts and prevents damage. Low oil can cause engine failure.',
        contentFa: 'روغن موتور قطعات متحرک را روان می‌کند و از آسیب جلوگیری می‌کند. کمبود روغن می‌تواند موجب خرابی موتور شود.',
      },
      {
        titleEn: 'When to Check',
        titleFa: 'کی چک کنیم',
        contentEn: 'Check oil level every 2 weeks. Park on level ground and wait 5 minutes after turning off engine.',
        contentFa: 'سطح روغن را هر ۲ هفته یک‌بار بررسی کنید. روی سطح صاف پارک کنید و ۵ دقیقه بعد از خاموش کردن موتور صبر کنید.',
      },
      {
        titleEn: 'How to Check',
        titleFa: 'چگونه چک کنیم',
        contentEn: 'Pull out the dipstick, wipe it clean, insert it back, then pull it out again. Oil should be between min and max marks.',
        contentFa: 'گیج را بیرون بکشید، تمیز کنید، دوباره داخل کنید و بیرون بکشید. روغن باید بین علامت‌های حداقل و حداکثر باشد.',
      },
    ],
  },
  {
    id: '2',
    titleEn: 'Tire Pressure',
    titleFa: 'فشار باد تایر',
    category: 'maintenance',
    categoryEn: 'Maintenance',
    categoryFa: 'نگهداری',
    icon: Gauge,
    bgColor: 'bg-gradient-to-br from-blue-200 to-blue-300',
    imageUrl: 'https://images.unsplash.com/photo-1758739956768-169833459935?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aXJlJTIwcHJlc3N1cmUlMjBnYXVnZXxlbnwxfHx8fDE3NjY5MzM5MzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    slides: [
      {
        titleEn: 'Why It Matters',
        titleFa: 'چرا مهم است',
        contentEn: 'Proper tire pressure improves fuel efficiency, tire life, and driving safety.',
        contentFa: 'فشار صحیح تایر باعث بهبود مصرف سوخت، عمر تایر و ایمنی رانندگی می‌شود.',
      },
      {
        titleEn: 'Check Monthly',
        titleFa: 'بررسی ماهانه',
        contentEn: 'Check tire pressure monthly when tires are cold. Temperature changes affect pressure.',
        contentFa: 'فشار تایر را ماهانه هنگامی که تایرها سرد هستند بررسی کنید. تغییرات دما بر فشار تأثیر می‌گذارد.',
      },
      {
        titleEn: 'Find the Right PSI',
        titleFa: 'فشار صحیح را پیدا کنید',
        contentEn: 'Check the sticker on driver\'s door jamb or owner\'s manual for recommended PSI, not the tire sidewall.',
        contentFa: 'برچسب روی لنگه در راننده یا دفترچه راهنما را برای PSI توصیه شده بررسی کنید، نه دیواره تایر.',
      },
    ],
  },
  {
    id: '3',
    titleEn: 'Warning Lights',
    titleFa: 'چراغ‌های هشدار',
    category: 'warnings',
    categoryEn: 'Warnings',
    categoryFa: 'هشدارها',
    icon: AlertCircle,
    bgColor: 'bg-gradient-to-br from-red-200 to-orange-200',
    imageUrl: 'https://images.unsplash.com/photo-1665326277911-0d82e7c526d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBkYXNoYm9hcmQlMjB3YXJuaW5nfGVufDF8fHx8MTc2NjkzMzkzMHww&ixlib=rb-4.1.0&q=80&w=1080',
    slides: [
      {
        titleEn: 'Red = Stop',
        titleFa: 'قرمز = توقف',
        contentEn: 'Red warning lights mean stop driving immediately. Continuing can cause serious damage.',
        contentFa: 'چراغ‌های هشدار قرمز به معنای توقف فوری رانندگی است. ادامه می‌تواند آسیب جدی وارد کند.',
      },
      {
        titleEn: 'Yellow = Service Soon',
        titleFa: 'زرد = سرویس به زودی',
        contentEn: 'Yellow or amber lights indicate service needed soon. Check your manual and schedule maintenance.',
        contentFa: 'چراغ‌های زرد یا نارنجی نشان می‌دهند به زودی نیاز به سرویس است. دفترچه راهنما را بررسی و سرویس را برنامه‌ریزی کنید.',
      },
      {
        titleEn: 'Common Lights',
        titleFa: 'چراغ‌های رایج',
        contentEn: 'Check engine, oil pressure, battery, brake system, and tire pressure warning lights are most common.',
        contentFa: 'چراغ چک موتور، فشار روغن، باتری، سیستم ترمز و فشار تایر رایج‌ترین چراغ‌های هشدار هستند.',
      },
    ],
  },
  {
    id: '4',
    titleEn: 'Brake Safety',
    titleFa: 'ایمنی ترمز',
    category: 'safety',
    categoryEn: 'Safety',
    categoryFa: 'ایمنی',
    icon: Shield,
    bgColor: 'bg-gradient-to-br from-purple-200 to-purple-300',
    imageUrl: 'https://images.unsplash.com/photo-1758563920433-027318cc48a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBicmFrZSUyMHN5c3RlbXxlbnwxfHx8fDE3NjY4NDkzODJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    slides: [
      {
        titleEn: 'Listen for Sounds',
        titleFa: 'به صداها گوش دهید',
        contentEn: 'Squealing or grinding noises when braking mean your brake pads need inspection or replacement.',
        contentFa: 'صداهای جیغ یا سایش هنگام ترمز گرفتن به معنای نیاز به بازرسی یا تعویض لنت‌های ترمز است.',
      },
      {
        titleEn: 'Check Brake Feel',
        titleFa: 'احساس ترمز را بررسی کنید',
        contentEn: 'If brake pedal feels spongy or car pulls to one side, get brakes checked immediately.',
        contentFa: 'اگر پدال ترمز نرم است یا خودرو به یک طرف کشیده می‌شود، فوراً ترمزها را بررسی کنید.',
      },
      {
        titleEn: 'Regular Inspection',
        titleFa: 'بازرسی منظم',
        contentEn: 'Have brake pads inspected every 12,000 km. Replace when thickness is less than 3mm.',
        contentFa: 'لنت‌های ترمز را هر ۱۲,۰۰۰ کیلومتر بازرسی کنید. وقتی ضخامت کمتر از ۳ میلی‌متر شد تعویض کنید.',
      },
    ],
  },
  {
    id: '5',
    titleEn: 'Regular Servicing',
    titleFa: 'سرویس منظم',
    category: 'maintenance',
    categoryEn: 'Maintenance',
    categoryFa: 'نگهداری',
    icon: Wrench,
    bgColor: 'bg-gradient-to-br from-indigo-200 to-indigo-300',
    imageUrl: 'https://images.unsplash.com/photo-1766637885444-2148f623d822?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBtYWludGVuYW5jZSUyMHNlcnZpY2V8ZW58MXx8fHwxNzY2ODQxMTQ4fDA&ixlib=rb-4.1.0&q=80&w=1080',
    slides: [
      {
        titleEn: 'Follow the Schedule',
        titleFa: 'برنامه را دنبال کنید',
        contentEn: 'Follow your manufacturer\'s service schedule. It\'s designed specifically for your car model.',
        contentFa: 'برنامه سرویس سازنده را دنبال کنید. مخصوص ��دل خودروی شما طراحی شده است.',
      },
      {
        titleEn: 'Prevents Big Problems',
        titleFa: 'از مشکلات بزرگ جلوگیری می‌کند',
        contentEn: 'Regular maintenance prevents costly repairs and keeps your car running efficiently.',
        contentFa: 'نگهداری منظم از تعمیرات پرهزینه جلوگیری می‌کند و خودرو را کارآمد نگه می‌دارد.',
      },
      {
        titleEn: 'Keep Records',
        titleFa: 'سوابق را نگه دارید',
        contentEn: 'Keep all service records. They prove maintenance history and increase resale value.',
        contentFa: 'تمام سوابق سرویس را نگه دارید. تاریخچه نگهداری را اثبات می‌کند و ارزش فروش مجدد را افزایش می‌دهد.',
      },
    ],
  },
  {
    id: '6',
    titleEn: 'Battery Care',
    titleFa: 'مراقبت از باتری',
    category: 'maintenance',
    categoryEn: 'Maintenance',
    categoryFa: 'نگهداری',
    icon: Battery,
    bgColor: 'bg-gradient-to-br from-yellow-200 to-amber-200',
    imageUrl: 'https://images.unsplash.com/photo-1597766325363-f5576d851d6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBiYXR0ZXJ5fGVufDF8fHx8MTc2NjkwNjIyN3ww&ixlib=rb-4.1.0&q=80&w=1080',
    slides: [
      {
        titleEn: 'Battery Lifespan',
        titleFa: 'عمر باتری',
        contentEn: 'Car batteries typically last 3-5 years. Age and extreme temperatures affect battery life.',
        contentFa: 'باتری خودرو معمولاً ۳ تا ۵ سال دوام می‌آورد. سن و دماهای شدید بر عمر باتری تأثیر می‌گذارند.',
      },
      {
        titleEn: 'Keep It Clean',
        titleFa: 'آن را تمیز نگه دارید',
        contentEn: 'Keep battery terminals clean and free from corrosion. Clean with baking soda and water.',
        contentFa: 'پایانه‌های باتری را تمیز و بدون خوردگی نگه دارید. با جوش شیرین و آب تمیز کنید.',
      },
      {
        titleEn: 'Warning Signs',
        titleFa: 'علائم هشدار',
        contentEn: 'If engine struggles to start or lights dim, get battery tested. Most auto shops test for free.',
        contentFa: 'اگر موتور در استارت مشکل دارد یا چراغ‌ها کم نور می‌شوند، باتری را تست کنید. اکثر تعمیرگاه‌ها رایگان تست می‌کنند.',
      },
    ],
  },
  {
    id: '7',
    titleEn: 'Smooth Driving',
    titleFa: 'رانندگی نرم',
    category: 'tips',
    categoryEn: 'Driving Tips',
    categoryFa: 'نکات رانندگی',
    icon: Zap,
    bgColor: 'bg-gradient-to-br from-green-200 to-teal-200',
    imageUrl: 'https://images.unsplash.com/photo-1597890975457-a6bf46602bcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzbW9vdGglMjBoaWdod2F5JTIwZHJpdmluZ3xlbnwxfHx8fDE3NjY5MzUxMTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    slides: [
      {
        titleEn: 'Save Fuel',
        titleFa: 'صرفه‌جویی در سوخت',
        contentEn: 'Avoid aggressive acceleration and hard braking. Smooth driving can improve fuel efficiency by up to 30%.',
        contentFa: 'از شتاب تند و ترمز شدید خودداری کنید. رانندگی نرم می‌تواند مصرف سوخت را تا ۳۰٪ بهبود بخشد.',
      },
      {
        titleEn: 'Less Wear',
        titleFa: 'سایش کمتر',
        contentEn: 'Gentle driving reduces wear on brakes, tires, and engine components.',
        contentFa: 'رانندگی ملایم سایش ترمز، تایر و قطعات موتور را کاهش می‌دهد.',
      },
      {
        titleEn: 'Safer Journey',
        titleFa: 'سفر ایمن‌تر',
        contentEn: 'Smooth acceleration and gradual braking make your journey safer and more comfortable.',
        contentFa: 'شتاب نرم و ترمز تدریجی سفر شما را ایمن‌تر و راحت‌تر می‌کند.',
      },
    ],
  },
  {
    id: '8',
    titleEn: 'Engine Temperature',
    titleFa: 'دمای موتور',
    category: 'warnings',
    categoryEn: 'Warnings',
    categoryFa: 'هشدارها',
    icon: ThermometerSun,
    bgColor: 'bg-gradient-to-br from-rose-200 to-pink-200',
    imageUrl: 'https://images.unsplash.com/photo-1764770073222-9f392a57f849?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXIlMjBlbmdpbmUlMjB0ZW1wZXJhdHVyZXxlbnwxfHx8fDE3NjY5MzM5MzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    slides: [
      {
        titleEn: 'Normal Range',
        titleFa: 'محدوده طبیعی',
        contentEn: 'Engine temperature should stay in the middle of the gauge. Overheating can cause serious damage.',
        contentFa: 'دمای موتور باید در وسط گیج بماند. گرم شدن بیش از حد می‌تواند آسیب جدی وارد کند.',
      },
      {
        titleEn: 'If Overheating',
        titleFa: 'اگر داغ شد',
        contentEn: 'If temperature rises, turn off AC, turn on heater, and pull over safely. Never open hot radiator cap.',
        contentFa: 'اگر دما بالا رفت، کولر را خاموش کنید، بخاری را روشن کنید و ایمن کنار بروید. هرگز درب رادیاتور داغ را باز نکنید.',
      },
      {
        titleEn: 'Check Coolant',
        titleFa: 'بررسی مایع خنک‌کننده',
        contentEn: 'Check coolant level monthly when engine is cold. Low coolant is a common cause of overheating.',
        contentFa: 'سطح مایع خنک‌کننده را ماهانه هنگامی که موتور سرد است بررسی کنید. کمبود مایع علت رایج داغ شدن است.',
      },
    ],
  },
];

export const EducationInsights: React.FC = () => {
  const { t, language } = useApp();
  const [selectedCard, setSelectedCard] = useState<InsightCard | null>(null);
  const isRTL = language === 'fa';

  // Group cards by category
  const categories = Array.from(new Set(insightCards.map(card => card.category)));
  const cardsByCategory = categories.map(category => ({
    category,
    titleEn: insightCards.find(c => c.category === category)?.categoryEn || category,
    titleFa: insightCards.find(c => c.category === category)?.categoryFa || category,
    cards: insightCards.filter(card => card.category === category),
  }));

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-lg border-b border-border/70 px-6 py-4">
        <h1 className="text-2xl font-bold text-foreground">{t('insights')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('insightsSubtitle')}</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto py-6 space-y-8">
        {cardsByCategory.map(({ category, titleEn, titleFa, cards }) => (
          <div key={category}>
            <h2 className="text-lg font-semibold text-foreground mb-4 px-6">
              {isRTL ? titleFa : titleEn}
            </h2>
            {/* Horizontal scrollable container */}
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex gap-3 px-6 pb-2" style={{ scrollSnapType: 'x mandatory' }}>
                {cards.map(card => {
                  const Icon = card.icon;
                  return (
                    <motion.div
                      key={card.id}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCard(card)}
                      className="rounded-3xl flex-shrink-0 w-[160px] h-[210px] cursor-pointer shadow-sm hover:shadow-sm transition-all relative overflow-hidden"
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      {/* Background Image */}
                      <ImageWithFallback
                        src={card.imageUrl}
                        alt={isRTL ? card.titleFa : card.titleEn}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      
                      {/* Gradient Overlay */}
                      <div className={`absolute inset-0 ${card.bgColor} opacity-70`} />
                      
                      {/* Decorative blur effect */}
                      <div className="absolute top-0 right-0 w-20 h-20 bg-card/20 rounded-full blur-2xl" />
                      
                      {/* Content */}
                      <div className="absolute inset-0 p-4 pb-5 flex flex-col justify-between">
                        <div className="flex justify-end relative z-10">
                          <div className="w-12 h-12 rounded-full bg-card/50 backdrop-blur-sm flex items-center justify-center shadow-sm">
                            <Icon className="w-6 h-6 text-gray-800" />
                          </div>
                        </div>
                        <div className="relative z-10">
                          <p className="text-sm font-bold text-gray-900 leading-snug drop-shadow-sm">
                            {isRTL ? card.titleFa : card.titleEn}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {selectedCard && (
          <StoryViewer
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

interface StoryViewerProps {
  card: InsightCard;
  onClose: () => void;
}

const StoryViewer: React.FC<StoryViewerProps> = ({ card, onClose }) => {
  const { language } = useApp();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const isRTL = language === 'fa';

  const currentSlide = card.slides[currentSlideIndex];
  const Icon = card.icon;

  const handleNext = () => {
    if (currentSlideIndex < card.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    // Reverse swipe logic for RTL
    if (isRTL) {
      if (isLeftSwipe) {
        handlePrevious();
      }
      if (isRightSwipe) {
        handleNext();
      }
    } else {
      if (isLeftSwipe) {
        handleNext();
      }
      if (isRightSwipe) {
        handlePrevious();
      }
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const clickX = e.clientX;
    const width = e.currentTarget.offsetWidth;
    const clickPosition = clickX / width;

    // Reverse tap zones for RTL
    if (isRTL) {
      // In RTL: right side (>0.7) = previous, left side (<0.3) = next
      if (clickPosition > 0.7) {
        handlePrevious();
      } else if (clickPosition < 0.3) {
        handleNext();
      }
    } else {
      // In LTR: left side (<0.3) = previous, right side (>0.7) = next
      if (clickPosition < 0.3) {
        handlePrevious();
      } else if (clickPosition > 0.7) {
        handleNext();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress Bars */}
      <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
        {card.slides.map((_, index) => (
          <div
            key={index}
            className="flex-1 h-0.5 rounded-full bg-card/30 overflow-hidden"
          >
            <motion.div
              className="h-full bg-card"
              initial={{ width: '0%' }}
              animate={{
                width: index < currentSlideIndex ? '100%' : index === currentSlideIndex ? '100%' : '0%',
              }}
              transition={{ duration: 0.3 }}
            />
          </div>
        ))}
      </div>

      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-8 right-4 z-20 w-8 h-8 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center text-primary-foreground hover:bg-card/30 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Slide Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlideIndex}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
          className={`max-w-md w-full px-8 ${isRTL ? 'text-right' : 'text-left'}`}
        >
          {/* Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center border-2 border-primary/50">
              <Icon className="w-12 h-12 text-primary" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-primary-foreground text-center mb-6">
            {isRTL ? currentSlide.titleFa : currentSlide.titleEn}
          </h2>

          {/* Content */}
          <p className="text-lg leading-relaxed text-primary-foreground/90 text-center">
            {isRTL ? currentSlide.contentFa : currentSlide.contentEn}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Arrow Navigation Hints */}
      {/* Left Arrow */}
      {((isRTL && currentSlideIndex < card.slides.length - 1) || (!isRTL && currentSlideIndex > 0)) && (
        <div className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <ChevronLeft className="w-5 h-5 text-primary-foreground/80" />
        </div>
      )}
      
      {/* Right Arrow */}
      {((isRTL && currentSlideIndex > 0) || (!isRTL && currentSlideIndex < card.slides.length - 1)) && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <ChevronRight className="w-5 h-5 text-primary-foreground/80" />
        </div>
      )}

      {/* Slide Counter */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary-foreground/60 text-sm">
        {currentSlideIndex + 1} / {card.slides.length}
      </div>
    </motion.div>
  );
};