import { z } from 'zod';

const baseSchema = z.object({
  type: z.enum(['customer', 'vendor', 'lead']),
  code: z.string().min(1, 'Code required'),
  name: z.string().min(1, 'Name required'),
  gstin: z.string().optional().default(''),
  state: z.string().min(1, 'State required'),
  stateCode: z.string().min(2, 'State code required'),
  phone: z.string().optional().default(''),
  email: z.string().email().optional().or(z.literal('')).default(''),
  notes: z.string().optional().default(''),
  active: z.boolean().default(true),
  // type-specific
  creditLimit: z.coerce.number().min(0).default(0),
  stage: z.enum(['new', 'contacted', 'qualified', 'won', 'lost']).optional(),
});

export const partySchema = baseSchema.superRefine((data, ctx) => {
  if (data.type === 'lead' && !data.stage) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['stage'],
      message: 'Select a lead stage',
    });
  }
  if (data.type === 'customer' && !data.stateCode) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['stateCode'],
      message: 'State is required for customers',
    });
  }
});