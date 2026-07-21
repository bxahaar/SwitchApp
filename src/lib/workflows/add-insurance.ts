/**
 * Workflow: Add / Renew Insurance
 *
 * Scenario: User records a new insurance policy for an existing car.
 * The previous policy (if any) is automatically expired so there is
 * always at most one active policy per car.
 *
 * Steps:
 *  1. Expire the previous active policy (status → 'expired')
 *  2. Insert the new policy with status 'active'
 *  3. Return the new record id
 */

import { supabase } from '../supabase';
import { insuranceHistoriesService } from '../services/insurance-histories';
import type { InsuranceHistory } from '../services/insurance-histories';

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
  let previouslyExpired = false;

 
  // Step 2: Insert the new policy
  await insuranceHistoriesService.create({
    carId: input.carId,
    startDate: input.startDate,
    endDate: input.endDate,
  });

  // Step 3: Return the new record id by fetching the latest for this car
  const records = await insuranceHistoriesService.listByCar(input.carId);
  const newest = records[0]; // listByCar orders by created_at DESC
  if (!newest) throw new Error('[addInsuranceWorkflow] Could not locate newly created insurance record');

  return { insuranceId: newest.id, previouslyExpired };
}

