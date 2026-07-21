/**
 * Workflow: Add / Renew Insurance
 *
 * Each renewal creates a new insurance history record. Previous records are
 * left untouched unless explicitly edited by the user.
 */

import { insuranceHistoriesService } from '../services/insurance-histories';

export interface AddInsuranceInput {
  carId: string;
  startDate: string;
  endDate: string;
}

export interface AddInsuranceResult {
  insuranceId: string;
  previouslyExpired: boolean;
}

export async function addInsuranceWorkflow(input: AddInsuranceInput): Promise<AddInsuranceResult> {
  await insuranceHistoriesService.create({
    carId: input.carId,
    startDate: input.startDate,
    endDate: input.endDate,
  });

  const records = await insuranceHistoriesService.listByCar(input.carId);
  const newest = records[0];
  if (!newest) throw new Error('[addInsuranceWorkflow] Could not locate newly created insurance record');

  return { insuranceId: newest.id, previouslyExpired: false };
}
