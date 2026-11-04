import { z } from 'zod';

export const vendorPaymentSchema = z.object({
  paymentDate: z.string().min(1),
  vendorId: z.string().min(1),
  mode: z.enum(['cash', 'bank', 'upi', 'cheque']),
  referenceNumber: z.string().optional().default(''),
  allocations: z.array(z.object({
    invoiceId: z.string().min(1, 'Select invoice'),
    amountRupees: z.coerce.number().positive(),
  })).min(1, 'Allocate at least one invoice'),
  notes: z.string().optional().default(''),
});