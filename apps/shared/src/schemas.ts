import { z } from 'zod';
import { RoleSchema } from './auth/types';

const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^\d{2}:\d{2}$/;

const isoOrDateRegex = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)?$/;

export const timeString = z.string().regex(timeRegex, {
  message: 'Invalid time format; expected HH:mm'
});

export const shortDateString = z.string().regex(dateRegex, {
  message: 'Invalid date format; expected YYYY-MM-DD'
});

export const dateString = z
  .string()
  .regex(isoOrDateRegex, {
    message: 'Invalid date format; expected YYYY-MM-DD or ISO-8601 string'
  })
  .transform((val) => (val.includes('T') ? val : new Date(val).toISOString()));

const rawDateRangeSchema = z.object({
  startDate: dateString,
  endDate: dateString
});

export const rawTimeSchema = z.object({
  startTime: timeString,
  endTime: timeString,
  duration: z.coerce.number().positive()
});

export const validateTimeRange = (
  data: { startTime: string; endTime: string; duration: number },
  ctx: z.RefinementCtx
) => {
  const start = new Date(`1970-01-01T${data.startTime}:00Z`);
  const end = new Date(`1970-01-01T${data.endTime}:00Z`);
  const duration = data.duration * 60 * 1000; // Convert minutes to milliseconds
  const expectedEnd = new Date(start.getTime() + duration);
  if (end < start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'End time must be after start time'
    });
  }
  if (end.getTime() !== expectedEnd.getTime()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'End time must be equal to start time + duration'
    });
  }
};

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
      id: z.string(),
      deleted: z.boolean(),
      color: z.string().regex(colorRegex, 'Color must be a valid hex color'),
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

export const clientSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  color: z.string().regex(colorRegex, 'Color must be a valid hex color')
});

export const projectSchema = z.object({
  address: z.string().nonempty('Address is required'),
  area: z.coerce.number(),
  city: z.string(),
  clientId: z.string(),
  color: z.string().regex(colorRegex, 'Color must be a valid hex color'),
  jobNumber: z.coerce.number().int().positive(),
  endClient: z.string(),
  deleted: z.boolean().optional()
});

export const updateUserSchema = z.object({
  id: z.string(),
  hourlyRate: z.coerce.number().min(0, 'Hourly rate must be a positive number'),
  firstName: z.string(),
  lastName: z.string(),
  role: RoleSchema
});

export const ContactSchema = z.object({
  name: z.string().min(1, 'Name is too short').max(50, 'Name is too long').trim(),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
  message: z.string().min(5, 'Message should be at least 5 characters long')
});

// Project file schemas
export const fileMetadataSchema = z.object({
  name: z.string().optional(),
  contentType: z.string(),
  size: z.number().int().positive(),
  projectId: z.string()
});

export const updateFileSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  isPinned: z.boolean().optional(),
  isArchived: z.boolean().optional()
});

export const getPresignedUrlSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
  projectId: z.string()
});

// Forum schemas
export const forumPostSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  content: z.string().min(1, 'Content is required'),
  userId: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  deleted: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  attachments: z.array(z.string()).optional()
});

export const forumCommentSchema = z.object({
  id: z.string().optional(),
  content: z.string().min(1, 'Comment is required'),
  postId: z.string(),
  userId: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  deleted: z.boolean().optional()
});

export const forumLikeSchema = z.object({
  id: z.string().optional(),
  postId: z.string().optional(),
  commentId: z.string().optional(),
  userId: z.string(),
  createdAt: z.string().optional()
});

export const forumViewSchema = z.object({
  id: z.string().optional(),
  postId: z.string(),
  userId: z.string(),
  viewedAt: z.string().optional()
});

export const forumAttachmentSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  contentType: z.string(),
  size: z.number().int().positive(),
  postId: z.string(),
  key: z.string()
});

export const getPresignedUrlForForumSchema = z.object({
  fileName: z.string(),
  contentType: z.string(),
  postId: z.string()
});
