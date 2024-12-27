import { protectedProcedure, trpc } from '@config/trpc';
import { authz } from '@dreams-built/shared/src/auth/permissions';
import { PaginationSchema } from '@dreams-built/shared/src/pagination/types';
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
