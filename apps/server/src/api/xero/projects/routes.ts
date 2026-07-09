import { protectedProcedure, trpc } from '@config/trpc';
import { authz } from '@dreams-built/shared/src/auth/permissions';
import { projectSchema } from '@dreams-built/shared/src/schemas';
import { TRPCError } from '@trpc/server';
import { invalidateXeroCache, XERO_CACHE_TTL, xeroCached } from 'libs/xero/cache';
import { withXero } from 'libs/xero/tokens';
import { z } from 'zod';
import { buildXeroProjectName, pushProjectToXero } from './service';

const listXeroProjects = async () =>
  xeroCached('projects:list', XERO_CACHE_TTL.short, async () =>
    withXero(async (xero, tenantId) => {
      const result = await xero.projectApi.getProjects(
        tenantId,
        undefined,
        undefined,
        undefined,
        1,
        500
      );

      return (result.body.items ?? []).map((item) => ({
        xeroProjectId: item.projectId ?? '',
        name: item.name,
        status: String(item.status ?? ''),
        deadlineUtc: item.deadlineUtc ?? null,
        estimateAmount: item.estimate?.value ?? null
      }));
    })
  );

export const xeroProjectsRouter = trpc.router({
  listXero: protectedProcedure([authz.jobs_read])
    .input(z.object({ query: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const xeroProjects = await listXeroProjects();

      const linkedProjects = await ctx.db.project.findMany({
        where: { xeroProjectId: { not: null }, deleted: false },
        select: { id: true, jobNumber: true, address: true, city: true, xeroProjectId: true }
      });

      const linkedByXeroId = new Map(linkedProjects.map((p) => [p.xeroProjectId, p]));

      const query = input?.query?.toLowerCase() ?? '';

      const projects = xeroProjects
        .filter((project) => !query || project.name.toLowerCase().includes(query))
        .map((project) => {
          const linked = linkedByXeroId.get(project.xeroProjectId);

          return {
            ...project,
            linkedProjectId: linked?.id ?? null,
            linkedJobNumber: linked?.jobNumber ?? null,
            drift: linked ? buildXeroProjectName(linked) !== project.name : false
          };
        });

      return { projects };
    }),

  link: protectedProcedure([authz.jobs_edit])
    .input(z.object({ projectId: z.string(), xeroProjectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const alreadyLinked = await ctx.db.project.findUnique({
        where: { xeroProjectId: input.xeroProjectId },
        select: { id: true, jobNumber: true }
      });

      if (alreadyLinked && alreadyLinked.id !== input.projectId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `That Xero project is already linked to job ${alreadyLinked.jobNumber}`
        });
      }

      return ctx.db.project.update({
        where: { id: input.projectId },
        data: { xeroProjectId: input.xeroProjectId, xeroSyncedAt: null }
      });
    }),

  unlink: protectedProcedure([authz.jobs_edit])
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ ctx, input }) =>
      ctx.db.project.update({
        where: { id: input.projectId },
        data: { xeroProjectId: null, xeroSyncedAt: null }
      })
    ),

  push: protectedProcedure([authz.jobs_edit])
    .input(z.object({ projectId: z.string() }))
    .mutation(async ({ input }) => pushProjectToXero(input.projectId)),

  import: protectedProcedure([authz.jobs_edit])
    .input(projectSchema.extend({ xeroProjectId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [clientExists, jobNumberExists, addressExists, alreadyLinked] =
        await Promise.all([
          ctx.db.client.findUnique({ where: { id: input.clientId } }),
          ctx.db.project.findUnique({ where: { jobNumber: input.jobNumber } }),
          ctx.db.project.findFirst({ where: { address: input.address } }),
          ctx.db.project.findUnique({ where: { xeroProjectId: input.xeroProjectId } })
        ]);

      if (!clientExists) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Client not found' });
      }

      if (jobNumberExists) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Job number already exists' });
      }

      if (addressExists) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Address already exists' });
      }

      if (alreadyLinked) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `That Xero project is already linked to job ${alreadyLinked.jobNumber}`
        });
      }

      return ctx.db.project.create({
        data: {
          address: input.address,
          endClient: input.endClient,
          area: input.area,
          city: input.city,
          client: { connect: { id: input.clientId } },
          color: input.color,
          jobNumber: input.jobNumber,
          xeroProjectId: input.xeroProjectId,
          xeroSyncedAt: new Date()
        }
      });
    }),

  listContacts: protectedProcedure([authz.xero_manage])
    .input(z.object({ query: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const contacts = await xeroCached(
        `contacts:search:${input?.query ?? ''}`,
        XERO_CACHE_TTL.short,
        async () =>
          withXero(async (xero, tenantId) => {
            const result = await xero.accountingApi.getContacts(
              tenantId,
              undefined,
              undefined,
              'Name',
              undefined,
              1,
              false,
              true,
              input?.query || undefined
            );

            return (result.body.contacts ?? []).map((contact) => ({
              id: contact.contactID ?? '',
              name: contact.name ?? ''
            }));
          })
      );

      return { contacts };
    }),

  linkClientContact: protectedProcedure([authz.xero_manage])
    .input(z.object({ clientId: z.string(), xeroContactId: z.string().nullable() }))
    .mutation(async ({ ctx, input }) => {
      if (input.xeroContactId) {
        const alreadyLinked = await ctx.db.client.findUnique({
          where: { xeroContactId: input.xeroContactId },
          select: { id: true, name: true }
        });

        if (alreadyLinked && alreadyLinked.id !== input.clientId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: `That Xero contact is already linked to ${alreadyLinked.name}`
          });
        }
      }

      await ctx.db.client.update({
        where: { id: input.clientId },
        data: { xeroContactId: input.xeroContactId }
      });
      invalidateXeroCache('contacts');

      return true;
    })
});
