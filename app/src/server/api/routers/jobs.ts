import { TRPCError } from '@trpc/server'
import { PaginationSchema } from 'utils/types'
import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'

const getJobsList = protectedProcedure()
  .input(PaginationSchema)
  .query(async ({ ctx, input }) => {
    const jobs = await ctx.db.project.findMany({
      select: {
        id: true,
        jobNumber: true,
        endClient: true,
        address: true,
        city: true,
        area: true,
        color: true,
        client: {
          select: {
            name: true,
            color: true,
          },
        },
      },
      take: input.perPage,
      skip: (input.page - 1) * input.perPage,
      where: {
        deleted: false,
      },
    })

    const total = await ctx.db.project.count({
      where: {
        deleted: false,
      },
    })

    return {
      jobs: jobs.map((job) => ({
        ...job,
        client: job.client.name,
        clientColor: job.client.color,
      })),
      total,
    }
  })

const getJobsSimpleList = protectedProcedure().query(async ({ ctx }) => {
  const jobs = await ctx.db.project.findMany({
    select: {
      id: true,
      jobNumber: true,
      address: true,
      endClient: true,
    },
    where: {
      deleted: false,
    },
  })

  return jobs
})

const getJob = protectedProcedure()
  .input(z.string().cuid())
  .query(async ({ ctx, input }) =>
    ctx.db.project.findUniqueOrThrow({
      where: {
        id: input,
      },
    }),
  )

const createJob = protectedProcedure()
  .input(
    z.object({
      address: z.string().trim(),
      area: z.number().optional().default(0),
      city: z.string().trim().optional().default(''),
      color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
      endClient: z.string().trim(),
      jobNumber: z.number().int(),
      clientId: z.string().cuid(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // check job number is unique
    const job = await ctx.db.project.findFirst({
      where: {
        jobNumber: input.jobNumber,
      },
    })

    if (job) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Job number already exists',
      })
    }

    const createdJob = await ctx.db.project.create({
      data: {
        address: input.address,
        area: input.area,
        city: input.city,
        color: input.color,
        endClient: input.endClient,
        jobNumber: input.jobNumber,
        clientId: input.clientId,
      },
    })

    // get next job number
    const nextJobNumber = await ctx.db.project.aggregate({
      _max: {
        jobNumber: true,
      },
    })

    return {
      ...createdJob,
      nextJobNumber: nextJobNumber._max.jobNumber ?? 0 + 1,
    }
  })

const updateJob = protectedProcedure()
  .input(
    z.object({
      id: z.string().cuid(),
      address: z.string().trim(),
      area: z.number().optional().default(0),
      city: z.string().trim(),
      color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
      endClient: z.string().trim(),
      jobNumber: z.number().int(),
      clientId: z.string().cuid(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    // check job number is unique
    const job = await ctx.db.project.findFirst({
      where: {
        jobNumber: input.jobNumber,
        NOT: {
          id: input.id,
        },
      },
    })

    if (job) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Job number already exists',
      })
    }

    const updatedJob = await ctx.db.project.update({
      where: {
        id: input.id,
      },
      data: {
        address: input.address,
        area: input.area,
        city: input.city,
        color: input.color,
        endClient: input.endClient,
        jobNumber: input.jobNumber,
        clientId: input.clientId,
      },
    })

    return updatedJob
  })

const deleteJob = protectedProcedure()
  .input(z.string().cuid())
  .mutation(async ({ ctx, input }) =>
    ctx.db.project.update({
      where: {
        id: input,
      },
      data: {
        deleted: true,
      },
    }),
  )

const getNextJobNumber = protectedProcedure().query(async ({ ctx }) => {
  const nextJobNumber = await ctx.db.project.aggregate({
    _max: {
      jobNumber: true,
    },
  })

  return nextJobNumber._max.jobNumber ?? 0 + 1
})

export const jobsRouter = createTRPCRouter({
  list: getJobsList,
  get: getJob,
  create: createJob,
  update: updateJob,
  delete: deleteJob,
  getNextJobNumber,
  simpleList: getJobsSimpleList,
})
