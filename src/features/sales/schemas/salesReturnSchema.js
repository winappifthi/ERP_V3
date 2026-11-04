import { z } from 'zod';
import { salesLineSchema } from './salesOrderSchema';

const returnLineSchema = salesLineSchema.extend({
  warehouseId: z.string().min(1, 'Select warehouse'),
  reason: z.string().min(1, 'Reason is required'),
});

export const salesReturnSchema = z.object({
  returnDate: z.string().min(1, 'Return date required'),
  customerId: z.string().min(1, 'Select customer'),
  sourceInvoiceId: z.string().min(1, 'Select source invoice'),
  restock: z.boolean().default(true),
  taxTreatment: z.enum(['intra', 'inter']),
  lines: z.array(returnLineSchema).min(1, 'Add at least one line'),
  notes: z.string().optional().default(''),
});