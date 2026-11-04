import { z } from 'zod';
import { purchaseLineSchema } from './purchaseOrderSchema';

const invLineSchema = purchaseLineSchema.omit({ warehouseId: true }).extend({
  warehouseId: z.string().optional(),
});

export const purchaseInvoiceSchema = z.object({
  invoiceDate: z.string().min(1),
  dueDate: z.string().optional(),
  vendorInvoiceNumber: z.string().min(1, 'Vendor invoice # required'),
  vendorId: z.string().min(1, 'Select vendor'),
  sourceReceiptId: z.string().optional(),
  taxTreatment: z.enum(['intra', 'inter']),
  lines: z.array(invLineSchema).min(1),
  charges: z.object({
    freightRupees: z.coerce.number().min(0).default(0),
    packingRupees: z.coerce.number().min(0).default(0),
    otherRupees: z.coerce.number().min(0).default(0),
  }),
  amountPaid: z.coerce.number().min(0).default(0),
  notes: z.string().optional().default(''),
});