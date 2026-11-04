import { z } from 'zod';

export const journalLineSchema = z.object({
  accountCode: z.string().min(1, 'Select account'),
  debitPaise: z.coerce.number().min(0).default(0),
  creditPaise: z.coerce.number().min(0).default(0),
  narration: z.string().optional().default(''),
}).refine((l) => (l.debitPaise > 0) !== (l.creditPaise > 0), {
  message: 'Enter either debit or credit, not both',
});

export const journalSchema = z.object({
  date: z.string().min(1, 'Required'),
  narration: z.string().min(1, 'Narration required'),
  lines: z.array(journalLineSchema).min(2, 'Need at least two lines'),
}).refine((j) => {
  const totalDebit = j.lines.reduce((s, l) => s + (l.debitPaise || 0), 0);
  const totalCredit = j.lines.reduce((s, l) => s + (l.creditPaise || 0), 0);
  return totalDebit === totalCredit && totalDebit > 0;
}, {
  message: 'Total debits must equal total credits',
  path: ['lines'],
});