import { z } from 'zod';

export const purchaseReturnSchema = z.object({
  returnDate: z.string().min(1),
  vendorId: z.string().min(1, 'Select vendor'),
  sourceInvoiceId: z.string().min(1, 'Select source invoice'),
  taxTreatment: z.enum(['intra', 'inter']),
  lines: z.array(z.object({
    productId: z.string(),
    quantity: z.coerce.number().positive(),
    unitPriceRupees: z.coerce.number().nonnegative(),
    taxRatePercent: z.coerce.number().min(0),
    taxTreatment: z.enum(['intra', 'inter', 'exempt', 'nil']),
    warehouseId: z.string(),
    reason: z.string().min(1, 'Reason required'),
  })).min(1),
  notes: z.string().optional().default(''),
});