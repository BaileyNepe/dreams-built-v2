import { protectedProcedure, trpc } from '@config/trpc';
import { authz } from '@dreams-built/shared/src/auth/permissions';
import { PaginationSchema } from '@dreams-built/shared/src/pagination/types';
import { projectSchema } from '@dreams-built/shared/src/schemas';
import { type Prisma } from '@prisma/client';
import { z } from 'zod';

export const projectsRouter = trpc.router({
  list: protectedProcedure([authz.jobs_read])
    .input(PaginationSchema)
    .query(async ({ ctx, input }) => {
      const { query } = input;

      const parsedJobNumber = Number.parseInt(query ?? '', 10);
      const isJobNumber = !Number.isNaN(parsedJobNumber);

      const orClause: Prisma.ProjectWhereInput[] = [];

      if (isJobNumber) {
        orClause.push({
          jobNumber: parsedJobNumber
        });
      }

      if (query) {
        orClause.push(
          { endClient: { contains: query, mode: 'insensitive' } },
          { address: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } }
        );
      }

      const whereParams: Prisma.ProjectWhereInput = {
        deleted: false,
        AND: [orClause.length > 0 ? { OR: orClause } : {}]
      };

      const projects = await ctx.db.project.findMany({
        select: {
          id: true,
          jobNumber: true,
          endClient: true,
          address: true,
          city: true,
          area: true,
          color: true,
          isInvoiced: true,
          client: {
            select: {
              name: true,
              color: true
            }
          }
        },
        take: input.perPage,
        skip: (input.page - 1) * input.perPage,
        where: whereParams,
        orderBy: {
          jobNumber: 'desc'
        }
      });

      const total = await ctx.db.project.count({
        where: whereParams
      });

      return {
        projects: projects.map((project) => ({
          ...project,
          client: project.client.name,
          clientColor: project.client.color
        })),
        total
      };
    }),

  get: protectedProcedure([authz.jobs_read])
    .input(z.string().nonempty())
    .query(
      async ({ ctx, input }) =>
        await ctx.db.project.findUnique({
          where: {
            id: input
          }
        })
    ),
  nextJobNumber: protectedProcedure([authz.jobs_read]).query(async ({ ctx }) => {
    const project = (await ctx.db.project.findFirst({
      select: {
        jobNumber: true
      },
      orderBy: {
        jobNumber: 'desc'
      }
    })) ?? { jobNumber: 0 };

    return project.jobNumber + 1;
  }),
  create: protectedProcedure([authz.jobs_edit])
    .input(projectSchema)
    .mutation(
      async ({ ctx, input }) =>
        await ctx.db.project.create({
          data: {
            address: input.address,
            endClient: input.endClient,
            area: input.area,
            city: input.city,
            client: {
              connect: {
                id: input.clientId
              }
            },
            color: input.color,
            jobNumber: input.jobNumber
          }
        })
    ),
  update: protectedProcedure([authz.jobs_edit])
    .input(
      z.object({
        projectId: z.string(),
        address: z.string(),
        area: z.number(),
        city: z.string(),
        clientId: z.string().cuid2(),
        endClient: z.string(),
        color: z.string(),
        jobNumber: z.number().int().min(5).max(6)
      })
    )
    .mutation(
      async ({ ctx, input }) =>
        await ctx.db.project.update({
          where: {
            id: input.projectId
          },
          data: {
            endClient: input.endClient,
            address: input.address,
            area: input.area,
            city: input.city,
            client: {
              connect: {
                id: input.clientId
              }
            },
            color: input.color,
            jobNumber: input.jobNumber
          }
        })
    ),

  toggleInvoiced: protectedProcedure([authz.jobs_edit])
    .input(
      z.object({
        projectId: z.string(),
        isInvoiced: z.boolean()
      })
    )
    .mutation(
      async ({ ctx, input }) =>
        await ctx.db.project.update({
          where: {
            id: input.projectId
          },
          data: {
            isInvoiced: input.isInvoiced
          }
        })
    )
});
