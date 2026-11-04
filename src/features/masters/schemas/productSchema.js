import { z } from 'zod';

export const productSchema = z.object({
  sku: z.string().min(1, 'SKU required'),
  name: z.string().min(1, 'Name required'),
  categoryId: z.string().min(1, 'Category required'),
  baseUom: z.string().min(1, 'UOM required'),
  sellingPrice: z.coerce.number().min(0, 'Must be ≥ 0'),
  purchasePrice: z.coerce.number().min(0, 'Must be ≥ 0'),
  taxCategoryId: z.string().min(1, 'Tax category required'),
  hsn: z.string().min(2, 'HSN at least 2 chars'),
  trackBatch: z.boolean().default(false),
  trackSerial: z.boolean().default(false),
  reorderLevel: z.coerce.number().min(0).default(10),
  active: z.boolean().default(true),
});