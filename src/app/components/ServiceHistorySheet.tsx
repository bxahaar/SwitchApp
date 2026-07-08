import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ServiceCard } from './ServiceCard';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Button } from './ui/button';
import { Download } from 'lucide-react';
import { formatDate } from '../utils/dateFormatter';
import { Timeline } from './Timeline';
import { TimelineItem } from './TimelineItem';

interface ServiceHistorySheetProps {
  children: React.ReactNode;
  selectedCarId?: string | null;
  onEditService?: (serviceId: string) => void;
}

export const ServiceHistorySheet: React.FC<ServiceHistorySheetProps> = ({ children, selectedCarId, onEditService }) => {
  const { t, services, language } = useApp();
  const [open, setOpen] = useState(false);

  // Filter services by selected car
  const filteredServices = selectedCarId 
    ? services.filter(s => s.carId === selectedCarId)
    : services;

  const handleExport = () => {
    // Mock export functionality
    const data = filteredServices.map(s => ({
      type: t(s.type),
      date: s.date,
      mileage: s.mileage,
      cost: s.cost,
      notes: s.notes
    }));
    
    console.log('Exporting service report:', data);
    alert('Service report exported successfully!');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh]">
        <SheetHeader>
          <SheetTitle>{t('serviceHistory')}</SheetTitle>
          <SheetDescription>{t('serviceHistoryDescription')}</SheetDescription>
        </SheetHeader>
        
        <div className="mt-4 mb-4">
          <Button 
            onClick={handleExport}
            variant="outline"
            className="w-full gap-2"
          >
            <Download className="h-4 w-4" />
            {t('exportReport')}
          </Button>
        </div>
        
        <div className="overflow-y-auto h-[calc(100%-8rem)] pb-4">
          {filteredServices.length > 0 ? (
            <>
              <Timeline language={language} variant="default" minHeight="auto">
                {filteredServices.map((service) => (
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
              
              {/* End of history indicator */}
              <div className="mt-[49px]">
                <span className="text-sm text-muted-foreground italic block text-center">
                  {t('endOfHistory')}
                </span>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>{t('noServices')}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};