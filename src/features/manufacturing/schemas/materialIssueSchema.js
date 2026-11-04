import { z } from 'zod';

export const materialIssueSchema = z.object({
  issueDate: z.string().min(1, 'Required'),
  lines: z.array(z.object({
    productId: z.string().min(1, 'Select product'),
    quantity: z.coerce.number().positive('Must be positive'),
    warehouseId: z.string().min(1, 'Select warehouse'),
  })).min(1, 'Add at least one line'),
});