import { z } from 'zod';
import { salesLineSchema } from './salesOrderSchema';

const invoiceLineSchema = salesLineSchema.extend({
  warehouseId: z.string().min(1, 'Select warehouse'),
});

export const salesInvoiceSchema = z.object({
  invoiceDate: z.string().min(1, 'Invoice date is required'),
  dueDate: z.string().optional(),
  customerId: z.string().min(1, 'Select a customer'),
  sourceOrderId: z.string().optional(),
  taxTreatment: z.enum(['intra', 'inter']),
  lines: z.array(invoiceLineSchema).min(1, 'Add at least one line'),
  headerDiscountRupees: z.coerce.number().min(0).default(0),
  charges: z.object({
    freightRupees: z.coerce.number().min(0).default(0),
    packingRupees: z.coerce.number().min(0).default(0),
    otherRupees: z.coerce.number().min(0).default(0),
  }),
  applyRoundOff: z.boolean().default(true),
  amountPaid: z.coerce.number().min(0).default(0),
  notes: z.string().max(500).optional().default(''),
});