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
  provider?: string | null;
  policyNumber?: string | null;
  cost?: number | null;
  notes?: string | null;
}

export interface AddInsuranceResult {
  insuranceId: string;
  previouslyExpired: boolean;
}

export async function addInsuranceWorkflow(input: AddInsuranceInput): Promise<AddInsuranceResult> {
  let previouslyExpired = false;

  // Step 1: Find and expire any currently active policy for this car
  const { data: active } = await supabase
    .from('insurance_histories')
    .select('id')
    .eq('car_id', input.carId)
    .eq('status', 'active')
    .limit(10);

  if (active && active.length > 0) {
    for (const row of active) {
      try {
        await insuranceHistoriesService.update(row.id, { status: 'expired' });
        previouslyExpired = true;
      } catch (err) {
        console.error('[addInsuranceWorkflow] Failed to expire old policy:', err);
      }
    }
  }

  // Step 2: Insert the new policy
  await insuranceHistoriesService.create({
    carId: input.carId,
    startDate: input.startDate,
    endDate: input.endDate,
    status: 'active',
    provider: input.provider ?? null,
    policyNumber: input.policyNumber ?? null,
    cost: input.cost ?? null,
    notes: input.notes ?? null,
  });

  // Step 3: Return the new record id by fetching the latest for this car
  const records = await insuranceHistoriesService.listByCar(input.carId);
  const newest = records[0]; // listByCar orders by created_at DESC
  if (!newest) throw new Error('[addInsuranceWorkflow] Could not locate newly created insurance record');

  return { insuranceId: newest.id, previouslyExpired };
}

/**
 * Helper: compute the human-readable validity status for display.
 * Returns 'active', 'expiring-soon' (within 30 days), or 'expired'.
 */
export function insuranceDisplayStatus(record: InsuranceHistory): 'active' | 'expiring-soon' | 'expired' {
  if (!record.endDate || record.status === 'expired') return 'expired';
  const end = new Date(record.endDate);
  const today = new Date();
  const daysLeft = Math.floor((end.getTime() - today.getTime()) / 86_400_000);
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 30) return 'expiring-soon';
  return 'active';
}
