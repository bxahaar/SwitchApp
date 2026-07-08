import React from 'react';
import { Car } from '../context/AppContext';
import { Car as CarIcon, Check } from 'lucide-react';

interface CarCardProps {
  car: Car;
  isSelected?: boolean;
  onClick?: () => void;
}

export const CarCard: React.FC<CarCardProps> = ({ car, isSelected = false, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`min-w-[280px] rounded-[calc(var(--radius)+8px)] p-5 shadow-sm transition-all duration-200 relative ${
        isSelected
          ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground'
          : 'bg-gradient-to-br from-primary/90 to-primary/70 text-primary-foreground/95 hover:from-primary hover:to-primary/80'
      }`}
    >
      {/* Selection Ring - Inset to avoid clipping */}
      {isSelected && (
        <div className="absolute inset-0 rounded-[calc(var(--radius)+8px)] ring-[3px] ring-inset ring-white/40 pointer-events-none" />
      )}
      <div className="flex items-start justify-between mb-4">
        <div className="h-12 w-12 rounded-full bg-card/20 backdrop-blur-sm flex items-center justify-center">
          <CarIcon className="h-6 w-6" />
        </div>
        {isSelected && (
          <div className="h-6 w-6 rounded-full bg-card flex items-center justify-center">
            <Check className="h-4 w-4 text-primary" />
          </div>
        )}
      </div>
      <div className="text-left">
        <h3 className="font-semibold mb-1">{car.name}</h3>
        <p className="text-sm text-primary-foreground/80">{car.licensePlate}</p>
      </div>
    </button>
  );
};