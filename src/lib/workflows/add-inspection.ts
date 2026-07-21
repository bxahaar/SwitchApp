/**
 * Workflow: Add / Renew Technical Inspection
 *
 * Each renewal creates a new inspection history record. Previous records are
 * left untouched unless explicitly edited by the user.
 */

import { inspectionHistoriesService } from '../services/inspection-histories';
import type { InspectionHistory } from '../services/inspection-histories';

export interface AddInspectionInput {
  carId: string;
  startDate: string;
  endDate: string;
}

export interface AddInspectionResult {
  inspectionId: string;
  previouslyExpired: boolean;
}

export async function addInspectionWorkflow(input: AddInspectionInput): Promise<AddInspectionResult> {
  await inspectionHistoriesService.create({
    carId: input.carId,
    startDate: input.startDate,
    endDate: input.endDate,
  });

  const records = await inspectionHistoriesService.listByCar(input.carId);
  const newest = records[0];
  if (!newest) throw new Error('[addInspectionWorkflow] Could not locate newly created inspection record');

  return { inspectionId: newest.id, previouslyExpired: false };
}

export function inspectionDisplayStatus(record: InspectionHistory): 'active' | 'expiring-soon' | 'expired' {
  if (!record.endDate) return 'expired';
  const end = new Date(record.endDate);
  const today = new Date();
  const daysLeft = Math.floor((end.getTime() - today.getTime()) / 86_400_000);
  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 30) return 'expiring-soon';
  return 'active';
}
