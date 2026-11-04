import { z } from 'zod';

export const purchaseLineSchema = z.object({
  productId: z.string().min(1, 'Select a product'),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  unitPriceRupees: z.coerce.number().nonnegative('Price must be ≥ 0'),
  discountPercent: z.coerce.number().min(0).max(100).default(0),
  taxRatePercent: z.coerce.number().min(0).max(100).default(18),
  taxTreatment: z.enum(['intra', 'inter', 'exempt', 'nil']).default('intra'),
  taxInclusive: z.boolean().default(false),
  warehouseId: z.string().min(1, 'Select warehouse'),
});

export const purchaseOrderSchema = z.object({
  orderDate: z.string().min(1, 'Required'),
  expectedDate: z.string().optional(),
  vendorId: z.string().min(1, 'Select vendor'),
  taxTreatment: z.enum(['intra', 'inter']),
  lines: z.array(purchaseLineSchema).min(1, 'Add at least one line'),
  charges: z.object({
    freightRupees: z.coerce.number().min(0).default(0),
    packingRupees: z.coerce.number().min(0).default(0),
    otherRupees: z.coerce.number().min(0).default(0),
  }),
  notes: z.string().max(500).optional().default(''),
});