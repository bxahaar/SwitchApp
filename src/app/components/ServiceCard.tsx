import React from 'react';
import { useApp, Service } from '../context/AppContext';
import { Gauge, Pencil } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

interface ServiceCardProps {
  service: Service;
  onEdit?: (serviceId: string) => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onEdit }) => {
  const { t, cars, language } = useApp();
  const car = cars.find(c => c.id === service.carId);

  return (
    <div className="rounded-xl bg-card border border-border/70 shadow-sm overflow-hidden">
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1" className="border-none">
          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-secondary/70 transition-colors">
            <div className="flex items-center justify-between w-full pr-2">
              <h4 className="text-card-foreground font-medium">{(service.typeName || t(service.type))}</h4>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Gauge className="h-4 w-4" />
                <span>{service.mileage.toLocaleString()} {t('km')}</span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-3">
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('cost')}</span>
                <span className="font-semibold text-card-foreground">
                  {language === 'fa' 
                    ? `${service.cost.toLocaleString()} تومان`
                    : `$${service.cost.toFixed(2)}`
                  }
                </span>
              </div>
              {service.serviceItems && service.serviceItems.length > 0 && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">{t('serviceItems')}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {service.serviceItems.map((item, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 rounded-lg bg-primary/10 text-primary text-xs"
                      >
                        {service.serviceItemLabels?.[item] ?? (t(item) !== item ? t(item) : item)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {service.notes && (
                <div>
                  <span className="text-sm text-muted-foreground block mb-1">{t('notes')}</span>
                  <p className="text-sm text-card-foreground">{service.notes}</p>
                </div>
              )}
              
              {/* Edit Button - Only visible when expanded */}
              {onEdit && (
                <div className="pt-2 mt-2 border-t border-border/70">
                  <button
                    onClick={() => onEdit(service.id)}
                    className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center hover:bg-accent transition-colors"
                  >
                    <Pencil className="h-4 w-4 text-foreground" />
                  </button>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};