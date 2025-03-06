import { z } from 'zod';

const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

export const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().regex(colorRegex, 'Color must be a valid hex color')
});

export const projectSchema = z.object({
  address: z.string().nonempty('Address is required'),
  area: z.number(),
  city: z.string(),
  clientId: z.string().cuid2(),
  color: z.string().regex(colorRegex, 'Color must be a valid hex color'),
  jobNumber: z.number().int().min(5).max(6),
  endClient: z.string()
});
