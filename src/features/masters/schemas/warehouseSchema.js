import { z } from 'zod';

export const warehouseSchema = z.object({
  code: z.string().min(1, 'Code required'),
  name: z.string().min(1, 'Name required'),
  branchId: z.string().min(1, 'Branch required'),
  type: z.enum(['retail', 'distribution', 'raw-material', 'finished-goods']),
  active: z.boolean().default(true),
});