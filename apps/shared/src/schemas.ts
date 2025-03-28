import { z } from 'zod';

const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
export const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const isoOrDateRegex = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)?$/;

const dateString = z
  .string()
  .regex(isoOrDateRegex, {
    message: 'Invalid date format; expected YYYY-MM-DD or ISO-8601 string'
  })
  .transform((val) => (val.includes('T') ? val : new Date(val).toISOString()));

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

const rawDateRangeSchema = z.object({
  startDate: dateString,
  endDate: dateString
});

const validateDateRange = (
  data: { startDate: string; endDate: string },
  ctx: z.RefinementCtx
) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  if (end < start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'End date must be after start date',
      path: ['endDate']
    });
  }
};

export const updateScheduleSchema = rawDateRangeSchema
  .merge(
    z.object({
      id: z.string().cuid2('ID is required'),
      deleted: z.boolean(),
      notes: z.string().optional()
    })
  )
  .superRefine(validateDateRange);

export const createScheduleSchema = rawDateRangeSchema
  .merge(
    z.object({
      projectPartId: z.string(),
      projectId: z.string(),
      notes: z.string().optional()
    })
  )
  .superRefine(validateDateRange);
