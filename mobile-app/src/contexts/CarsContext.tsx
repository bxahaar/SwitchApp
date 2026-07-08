import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Car } from '../types';

interface CarsContextType {
  cars: Car[];
  selectedCarId: string | null;
  setCars: (cars: Car[]) => void;
  selectCar: (carId: string) => void;
  addCar: (car: Car) => void;
  updateCar: (carId: string, updates: Partial<Car>) => void;
  removeCar: (carId: string) => void;
}

const CarsContext = createContext<CarsContextType | undefined>(undefined);

export function CarsProvider({ children }: { children: ReactNode }) {
  const [cars, setCarsState] = useState<Car[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null);

  const setCars = (newCars: Car[]) => {
    setCarsState(newCars);
    
    // Auto-select first car if none selected
    if (!selectedCarId && newCars.length > 0) {
      setSelectedCarId(newCars[0].id);
    }
  };

  const selectCar = (carId: string) => {
    setSelectedCarId(carId);
  };

  const addCar = (car: Car) => {
    setCarsState((prev) => [...prev, car]);
    
    // Auto-select if it's the first car
    if (cars.length === 0) {
      setSelectedCarId(car.id);
    }
  };

  const updateCar = (carId: string, updates: Partial<Car>) => {
    setCarsState((prev) =>
      prev.map((car) => (car.id === carId ? { ...car, ...updates } : car))
    );
  };

  const removeCar = (carId: string) => {
    setCarsState((prev) => prev.filter((car) => car.id !== carId));
    
    // If removed car was selected, select another
    if (selectedCarId === carId) {
      const remaining = cars.filter((car) => car.id !== carId);
      setSelectedCarId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  return (
    <CarsContext.Provider
      value={{ cars, selectedCarId, setCars, selectCar, addCar, updateCar, removeCar }}
    >
      {children}
    </CarsContext.Provider>
  );
}

export function useCars() {
  const context = useContext(CarsContext);
  if (!context) {
    throw new Error('useCars must be used within CarsProvider');
  }
  return context;
}
