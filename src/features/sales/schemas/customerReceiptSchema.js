import { z } from 'zod';

export const receiptAllocationSchema = z.object({
  invoiceId: z.string().min(1, 'Select invoice'),
  amountRupees: z.coerce.number().positive('Amount must be positive'),
});

export const customerReceiptSchema = z.object({
  receiptDate: z.string().min(1, 'Receipt date required'),
  customerId: z.string().min(1, 'Select customer'),
  mode: z.enum(['cash', 'bank', 'upi', 'cheque']),
  referenceNumber: z.string().optional().default(''),
  allocations: z.array(receiptAllocationSchema).min(1, 'Allocate at least one invoice'),
  notes: z.string().optional().default(''),
});