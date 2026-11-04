import { z } from 'zod';

export const stockTransferSchema = z.object({
  transferDate: z.string().min(1, 'Required'),
  sourceWarehouseId: z.string().min(1, 'Select source warehouse'),
  destinationWarehouseId: z.string().min(1, 'Select destination warehouse'),
  lines: z.array(z.object({
    productId: z.string().min(1, 'Select product'),
    quantity: z.coerce.number().positive('Quantity must be positive'),
  })).min(1, 'Add at least one line'),
  notes: z.string().optional().default(''),
}).refine((d) => d.sourceWarehouseId !== d.destinationWarehouseId, {
  message: 'Source and destination must be different',
  path: ['destinationWarehouseId'],
});