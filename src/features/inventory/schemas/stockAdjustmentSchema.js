import { z } from 'zod';

export const stockAdjustmentSchema = z.object({
  adjustmentDate: z.string().min(1, 'Required'),
  warehouseId: z.string().min(1, 'Select warehouse'),
  lines: z.array(z.object({
    productId: z.string().min(1, 'Select product'),
    quantity: z.coerce.number().refine((n) => n !== 0, 'Quantity cannot be zero'),
    reason: z.enum(['damaged', 'expired', 'found', 'shrinkage', 'sample', 'other']),
    notes: z.string().optional().default(''),
  })).min(1, 'Add at least one line'),
  notes: z.string().optional().default(''),
});