import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { CarCard } from './CarCard';
import { ServiceCard } from './ServiceCard';
import { SwipeableReminderCard } from './SwipeableReminderCard';
import { Settings as SettingsIcon, User, LogOut, Shield } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { ServiceHistorySheet } from './ServiceHistorySheet';
import { formatDate } from '../utils/dateFormatter';
import { Timeline } from './Timeline';
import { TimelineItem } from './TimelineItem';
import { PrivacyPolicy } from './PrivacyPolicy';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  onNavigate?: (tab: 'cars' | 'addService') => void;
  onStartServiceWithReminder?: (serviceId: string) => void;
  onEditService?: (serviceId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onStartServiceWithReminder, onEditService }) => {
  const { t, cars, services, theme, setTheme, language, setLanguage, deleteService, reminders, deleteReminder } = useApp();
  const { logout, phoneNumber } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [openSwipeCardId, setOpenSwipeCardId] = useState<string | null>(null);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(
    cars.length > 0 ? cars[0].id : null
  );

  // Update selected car when cars change
  React.useEffect(() => {
    if (cars.length > 0 && !selectedCarId) {
      setSelectedCarId(cars[0].id);
    } else if (cars.length === 0) {
      setSelectedCarId(null);
    } else if (selectedCarId && !cars.find(c => c.id === selectedCarId)) {
      setSelectedCarId(cars[0].id);
    }
  }, [cars, selectedCarId]);

  // Filter services by selected car
  const filteredServices = selectedCarId 
    ? services.filter(s => s.carId === selectedCarId)
    : services;

  // Filter reminders by selected car
  const filteredReminders = selectedCarId
    ? reminders.filter(r => r.carId === selectedCarId)
    : reminders;

  // Calculate upcoming services for selected car (from services with reminders)
  const upcomingServicesFromHistory = filteredServices.filter(s => s.nextServiceType && s.nextServiceValue);
  
  // Combine upcoming services from history and standalone reminders
  const allUpcomingItems = [
    ...upcomingServicesFromHistory.map(s => ({ ...s, isStandaloneReminder: false })),
    ...filteredReminders.map(r => ({
      id: r.id,
      carId: r.carId,
      type: r.type,
      nextServiceType: r.reminderType,
      nextServiceValue: r.reminderValue,
      reminderNote: r.reminderNote,
      isStandaloneReminder: true,
    }))
  ];
  
  // Get recent services for selected car (limited to 3)
  const recentServices = filteredServices.slice(0, 3);

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Top App Bar */}
      <div className="sticky top-0 z-10 bg-card/80 backdrop-blur-lg border-b border-border/70">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
          </div>
          
          <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
            <SheetTrigger asChild>
              <button className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center hover:bg-accent transition-colors">
                <SettingsIcon className="h-5 w-5 text-foreground" />
              </button>
            </SheetTrigger>
            <SheetContent side={language === 'fa' ? 'left' : 'right'}>
              <SheetHeader>
                <SheetTitle className="text-left my-4">{t('settings')}</SheetTitle>
                <SheetDescription className="text-left">{t('settingsDescription')}</SheetDescription>
              </SheetHeader>
              <div className="mt-[24px] space-y-6 mr-[16px] mb-[0px] ml-[16px]">
                {/* Theme Toggle */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="theme-mode">{theme === 'dark' ? t('darkMode') : t('lightMode')}</Label>
                  <Switch
                    id="theme-mode"
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                    className="[&>[data-slot=switch-thumb]]:data-[state=checked]:rtl:-translate-x-[calc(100%-2px)] [&>[data-slot=switch-thumb]]:data-[state=unchecked]:rtl:translate-x-0"
                  />
                </div>
                
                {/* Language Toggle */}
                <div className="space-y-3">
                  <Label>{t('language')}</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={language === 'en' ? 'default' : 'outline'}
                      onClick={() => setLanguage('en')}
                      className={language === 'en' ? 'bg-primary hover:bg-primary/90' : ''}
                    >
                      {t('english')}
                    </Button>
                    <Button
                      variant={language === 'fa' ? 'default' : 'outline'}
                      onClick={() => setLanguage('fa')}
                      className={language === 'fa' ? 'bg-primary hover:bg-primary/90' : ''}
                    >
                      {t('persian')}
                    </Button>
                  </div>
                </div>
                
                {/* Phone Number Display */}
                {phoneNumber && (
                  <div className="space-y-2 pt-4 border-t border-border/70">
                    <Label className="text-muted-foreground">{t('phoneNumber')}</Label>
                    <div className="px-4 py-3 rounded-xl bg-secondary/70 border border-border/70">
                      <p className="text-foreground font-medium" dir="ltr">
                        {phoneNumber}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Privacy Policy */}
                <div className="pt-4 border-t border-border/70">
                  <Sheet open={privacyOpen} onOpenChange={setPrivacyOpen}>
                    <SheetTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        {language === 'fa' ? 'سیاست حفظ حریم خصوصی' : 'Privacy Policy'}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[90vh]">
                      <SheetHeader>
                        <SheetTitle className="text-center">
                          {language === 'fa' ? 'سیاست حفظ حریم خصوصی' : 'Privacy Policy'}
                        </SheetTitle>
                        <SheetDescription className="text-center">
                          {language === 'fa' 
                            ? 'اطلاعات مربوط به حفظ حریم خصوصی و نحوه استفاده از داده‌های شما'
                            : 'Information about how we handle and protect your data'
                          }
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-4 h-[calc(100%-4rem)] overflow-hidden">
                        <PrivacyPolicy />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
                
                {/* Logout Button */}
                <div className="pt-4 border-t border-border/70">
                  <Button
                    variant="outline"
                    onClick={() => {
                      logout();
                      setSettingsOpen(false);
                    }}
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {language === 'fa' ? 'خروج از حساب' : 'Logout'}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-4 pb-24">
          {/* Cars Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-foreground">{t('cars')}</h2>
              <button 
                className="text-primary hover:underline"
                onClick={() => onNavigate?.('cars')}
              >
                {t('manageCars')}
              </button>
            </div>
            {cars.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {cars.map(car => (
                  <CarCard 
                    key={car.id} 
                    car={car}
                    isSelected={car.id === selectedCarId}
                    onClick={() => setSelectedCarId(car.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4 rounded-xl bg-secondary/70">
                <p className="text-muted-foreground mb-3">{t('noCars')}</p>
                <button
                  onClick={() => onNavigate?.('cars')}
                  className="text-primary hover:underline"
                >
                  {t('addNewCar')}
                </button>
              </div>
            )}
          </section>

          {/* Upcoming Services */}
          {allUpcomingItems.length > 0 && (
            <section>
              <h2 className="mb-4 text-foreground">{t('upcomingServices')}</h2>
              <AnimatePresence mode="popLayout">
                <div className="space-y-3">
                  {allUpcomingItems.map(item => {
                    const car = cars.find(c => c.id === item.carId);
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <SwipeableReminderCard
                          service={item}
                          isOpen={openSwipeCardId === item.id}
                          onOpenChange={(open) => setOpenSwipeCardId(open ? item.id : null)}
                          onDelete={() => {
                            if (item.isStandaloneReminder) {
                              deleteReminder(item.id);
                            } else {
                              deleteService(item.id);
                            }
                            setOpenSwipeCardId(null);
                          }}
                          onDone={() => {
                            if (onStartServiceWithReminder) {
                              onStartServiceWithReminder(item.id);
                            }
                          }}
                        >
                          <div className="rounded-xl bg-card border border-border/70 p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                  <div className="h-2 w-2 rounded-full bg-primary" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-card-foreground">{t(item.type)}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    {item.nextServiceType === 'mileage' 
                                      ? `${t('at')} ${item.nextServiceValue?.toLocaleString()} ${t('km')}`
                                      : `${t('in')} ${Math.ceil((new Date(item.nextServiceValue as string).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} ${t('days')}`
                                    }
                                  </p>
                                  {item.reminderNote && (
                                    <p className="text-xs text-muted-foreground mt-1 italic">
                                      {item.reminderNote}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </SwipeableReminderCard>
                      </motion.div>
                    );
                  })}
                </div>
              </AnimatePresence>
            </section>
          )}

          {/* Service History Preview */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-foreground">{t('serviceHistory')}</h2>
            </div>
            
            {recentServices.length > 0 ? (
              <>
                <Timeline language={language} variant="default">
                  {recentServices.map((service) => (
                    <TimelineItem
                      key={service.id}
                      label={formatDate(service.date, language)}
                      language={language}
                      variant="default"
                    >
                      <ServiceCard service={service} onEdit={onEditService} />
                    </TimelineItem>
                  ))}
                </Timeline>
                
                {/* View all button */}
                {filteredServices.length > 3 && (
                  <div className="mt-2">
                    <span className="text-sm text-muted-foreground italic block text-center">
                      {t('endOfHistory')}
                    </span>
                  </div>
                )}
                
                <ServiceHistorySheet selectedCarId={selectedCarId} onEditService={onEditService}>
                  <button className="mt-4 w-full text-center text-primary hover:underline">
                    {t('viewAll')}
                  </button>
                </ServiceHistorySheet>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>{t('noServices')}</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};