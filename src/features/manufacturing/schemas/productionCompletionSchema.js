import { z } from 'zod';

export const productionCompletionSchema = z.object({
  completionDate: z.string().min(1, 'Required'),
  completedQuantity: z.coerce.number().positive('Must be positive'),
  scrapQuantity: z.coerce.number().min(0).default(0),
  byProductLines: z.array(z.object({
    productId: z.string(),
    quantity: z.coerce.number().min(0),
  })).optional().default([]),
  warehouseId: z.string().min(1, 'Select finished goods warehouse'),
  notes: z.string().optional().default(''),
});