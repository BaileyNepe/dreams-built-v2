import { z } from 'zod';

const InfoBlockSchema = z.object({
  iconText: z.string(),
  title: z.string(),
  text: z.string(),
  linkTitle: z.string(),
  linkUrl: z.string().optional(),
});

const VariantSchema = z.enum(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark', 'light']);

const PortalMessageSchema = z.object({
  variant: VariantSchema,
  message: z.string(),
});

const DashboardConfigSchema = z.object({
  portalMessage: PortalMessageSchema,
  content: z.array(InfoBlockSchema),
});

const ConfigSchema = z.object({
  admin: DashboardConfigSchema,
  employee: DashboardConfigSchema,
  default: DashboardConfigSchema,
});

export type ConfigSchema = z.infer<typeof ConfigSchema>;
