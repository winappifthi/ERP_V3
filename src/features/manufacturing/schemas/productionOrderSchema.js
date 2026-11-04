import { z } from 'zod';

export const productionOrderSchema = z.object({
  bomId: z.string().min(1, 'Select BOM'),
  plannedQuantity: z.coerce.number().positive('Must be positive'),
  startDate: z.string().min(1, 'Required'),
  expectedCompletionDate: z.string().min(1, 'Required'),
  workCenterId: z.string().min(1, 'Select work center'),
  notes: z.string().optional().default(''),
});