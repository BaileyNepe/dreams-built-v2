import { z } from 'zod';

export const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color must be a valid hex color')
});
