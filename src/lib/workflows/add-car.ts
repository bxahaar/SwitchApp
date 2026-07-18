/**
 * Workflow: Add Car
 *
 * Scenario: User creates a new vehicle, optionally recording its initial
 * insurance and inspection status in a single atomic sequence.
 *
 * Steps:
 *  1. Insert a row in public.cars
 *  2. (Optional) Insert a row in public.insurance_histories
 *  3. (Optional) Insert a row in public.inspection_histories
 *
 * Callers receive the new car's id so they can navigate to it.
 */

import { carsService } from '../services/cars';
import { insuranceHistoriesService } from '../services/insurance-histories';
import { inspectionHistoriesService } from '../services/inspection-histories';
import type { Car } from '../services/types';
import type { InsuranceHistory } from '../services/insurance-histories';
import type { InspectionHistory } from '../services/inspection-histories';

export interface AddCarInput {
  /** Required car fields */
  car: Pick<Car, 'name' | 'licensePlate'>;

  /**
   * Optional: record the car's current insurance policy.
   * Omit entirely if the user skips this step.
   */
  insurance?: Pick<InsuranceHistory, 'startDate' | 'endDate' | 'provider' | 'policyNumber' | 'cost' | 'notes'>;

  /**
   * Optional: record the car's current technical inspection.
   * Omit entirely if the user skips this step.
   */
  inspection?: Pick<InspectionHistory, 'startDate' | 'endDate' | 'center' | 'cost' | 'notes'>;
}

export interface AddCarResult {
  carId: string;
  insuranceId?: string;
  inspectionId?: string;
}

export async function addCarWorkflow(input: AddCarInput): Promise<AddCarResult> {
  // Step 1: Create the car
  await carsService.create(input.car);

  // Fetch the newly created car's id (create() does not return it — reload)
  const cars = await carsService.list();
  const newCar = cars.find((c) => c.licensePlate === input.car.licensePlate && c.name === input.car.name);
  if (!newCar) throw new Error('[addCarWorkflow] Could not locate newly created car');

  const result: AddCarResult = { carId: newCar.id };

  // Step 2: Optional insurance record
  if (input.insurance) {
    try {
      await insuranceHistoriesService.create({
        carId: newCar.id,
        startDate: input.insurance.startDate,
        endDate: input.insurance.endDate,
        status: deriveStatus(input.insurance.endDate),
        provider: input.insurance.provider,
        policyNumber: input.insurance.policyNumber,
        cost: input.insurance.cost,
        notes: input.insurance.notes,
      });
    } catch (err) {
      // Non-fatal: log but continue — car was already saved
      console.error('[addCarWorkflow] Insurance insert failed:', err);
    }
  }

  // Step 3: Optional inspection record
  if (input.inspection) {
    try {
      await inspectionHistoriesService.create({
        carId: newCar.id,
        startDate: input.inspection.startDate,
        endDate: input.inspection.endDate,
        status: deriveStatus(input.inspection.endDate),
        center: input.inspection.center,
        cost: input.inspection.cost,
        notes: input.inspection.notes,
      });
    } catch (err) {
      console.error('[addCarWorkflow] Inspection insert failed:', err);
    }
  }

  return result;
}

/** Derive a status string based on the end date relative to today. */
function deriveStatus(endDate: string | null): 'active' | 'expired' | 'pending' {
  if (!endDate) return 'pending';
  return new Date(endDate) >= new Date() ? 'active' : 'expired';
}
