import { z } from 'zod';

export const workCenterSchema = z.object({
  code: z.string().min(1, 'Code required'),
  name: z.string().min(1, 'Name required'),
  capacityPerDay: z.coerce.number().positive('Must be positive'),
  hourlyRate: z.coerce.number().min(0),
});