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

      // Attempt to parse the query to an integer
      const parsedJobNumber = Number.parseInt(query ?? '', 10);
      const isJobNumber = !Number.isNaN(parsedJobNumber);

      // Build the OR array for the search
      const orClause: Prisma.ProjectWhereInput[] = [];

      // If we can parse the string into a valid int,
      // include jobNumber equality in the OR clause.
      if (isJobNumber) {
        orClause.push({
          jobNumber: parsedJobNumber
        });
      }

      // Add string-based partial matches for other fields
      if (query) {
        orClause.push(
          { endClient: { contains: query, mode: 'insensitive' } },
          { address: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } }
        );
      }

      const whereParams: Prisma.ProjectWhereInput = {
        deleted: false,
        AND: [
          // Only attach the OR if there's at least one clause
          orClause.length > 0 ? { OR: orClause } : {}
        ]
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
  infiniteList: protectedProcedure([authz.jobs_read])
    .input(
      z.object({
        query: z.string().optional(),
        cursor: z.string().nullish(),
        limit: z.number().default(10)
      })
    )
    .query(async ({ ctx, input }) => {
      const { query, limit, cursor } = input;

      const orClause: Prisma.ProjectWhereInput[] = [];

      // Attempt to parse integer
      if (query) {
        const parsed = parseInt(query, 10);
        if (!Number.isNaN(parsed)) {
          // add integer filter
          orClause.push({ jobNumber: { equals: parsed } });
        }

        // add string filters
        orClause.push(
          { address: { contains: query, mode: 'insensitive' } }
          // any other text fields
        );
      }

      const where: Prisma.ProjectWhereInput = {
        deleted: false,
        AND: [orClause.length ? { OR: orClause } : {}]
      };

      // If we store the cursor as a project id or something
      const projects = await ctx.db.project.findMany({
        take: limit + 1,
        skip: 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { jobNumber: 'desc' },
        where
      });

      // Determine nextCursor
      let nextCursor: typeof cursor = null;
      if (projects.length > limit) {
        // pop the extra item
        const next = projects.pop();
        if (next) {
          nextCursor = next.id;
        }
      }

      return {
        projects,
        nextCursor
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
