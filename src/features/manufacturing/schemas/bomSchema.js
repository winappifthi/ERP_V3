import { z } from 'zod';

export const bomSchema = z.object({
  outputProductId: z.string().min(1, 'Select output product'),
  version: z.string().min(1, 'Version required'),
  outputQuantity: z.coerce.number().positive('Must be positive').default(1),
  scrapPercent: z.coerce.number().min(0).max(100).default(0),
  lines: z.array(z.object({
    productId: z.string().min(1, 'Select component'),
    quantity: z.coerce.number().positive('Must be positive'),
    scrapPercent: z.coerce.number().min(0).max(100).default(0),
  })).min(1, 'Add at least one component'),
  laborCostPerUnit: z.coerce.number().min(0).default(0),
  overheadCostPerUnit: z.coerce.number().min(0).default(0),
  notes: z.string().optional().default(''),
});