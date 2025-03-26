import { z } from 'zod';

const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
export const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().regex(colorRegex, 'Color must be a valid hex color')
});

export const projectSchema = z.object({
  address: z.string().nonempty('Address is required'),
  area: z.coerce.number(),
  city: z.string(),
  clientId: z.string().cuid2('Client is required'),
  color: z.string().regex(colorRegex, 'Color must be a valid hex color'),
  jobNumber: z.coerce.number().int().positive(),
  endClient: z.string()
});
