import { z } from 'zod';

const grnLineSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unitPriceRupees: z.coerce.number().nonnegative(),
  taxRatePercent: z.coerce.number().min(0).max(100),
  taxTreatment: z.enum(['intra', 'inter', 'exempt', 'nil']),
  warehouseId: z.string().min(1),
});

export const goodsReceiptSchema = z.object({
  receiptDate: z.string().min(1, 'Required'),
  sourceOrderId: z.string().min(1, 'Select purchase order'),
  vendorId: z.string().min(1),
  lines: z.array(grnLineSchema).min(1, 'Add at least one line'),
  notes: z.string().optional().default(''),
});