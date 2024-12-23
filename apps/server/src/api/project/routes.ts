import { protectedProcedure, trpc } from '@config/trpc';
import { authz } from '@dreams-built/shared/src/auth/permissions';
import { PaginationSchema } from '@dreams-built/shared/src/pagination/types';
import { type Prisma } from '@prisma/client';

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
    })
});
