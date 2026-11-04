import { z } from 'zod';

export const salesLineSchema = z.object({
  productId: z.string().min(1, 'Select a product'),
  quantity: z.coerce
    .number({ invalid_type_error: 'Quantity must be a number' })
    .positive('Quantity must be positive'),
  unitPriceRupees: z.coerce
    .number({ invalid_type_error: 'Price must be a number' })
    .nonnegative('Price cannot be negative'),
  discountPercent: z.coerce
    .number()
    .min(0, 'Discount cannot be negative')
    .max(100, 'Discount cannot exceed 100%')
    .default(0),
  taxRatePercent: z.coerce.number().min(0).max(100).default(18),
  taxTreatment: z.enum(['intra', 'inter', 'exempt', 'nil']).default('intra'),
  taxInclusive: z.boolean().default(false),
});

export const salesOrderSchema = z.object({
  orderDate: z.string().min(1, 'Order date is required'),
  customerId: z.string().min(1, 'Select a customer'),
  taxTreatment: z.enum(['intra', 'inter']),
  lines: z.array(salesLineSchema).min(1, 'Add at least one line item'),
  headerDiscountRupees: z.coerce.number().min(0).default(0),
  charges: z.object({
    freightRupees: z.coerce.number().min(0).default(0),
    packingRupees: z.coerce.number().min(0).default(0),
    otherRupees: z.coerce.number().min(0).default(0),
  }),
  applyRoundOff: z.boolean().default(true),
  notes: z.string().max(500).optional().default(''),
});