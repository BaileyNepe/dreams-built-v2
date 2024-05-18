import { getSession } from '@auth0/nextjs-auth0'
import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'

import { type NextRequest, NextResponse } from 'next/server'
import { db } from 'server/db'
import { getRolePermissions } from 'utils/auth/roles'
import { type Authz } from 'utils/auth/types'

/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (
  opts: { headers: Headers },
  req?: NextRequest,
) => {
  const res = new NextResponse()

  let session = null
  if (req) {
    session = await getSession(req, res)
  }

  return {
    db,
    session,
    ...opts,
  }
}

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure

type AuthorizeMiddlewareOptions = {
  requireAllPermissions?: boolean
}

const getAuthzStatus = ({
  permissions,
  requiredPermissions,
  options,
}: {
  permissions: string[]
  requiredPermissions: Authz[]
  options: AuthorizeMiddlewareOptions
}) => {
  if (requiredPermissions.length === 0) return true
  if (permissions.length === 0) return false

  const hasPermission = (permission: Authz) => permissions.includes(permission)

  if (options.requireAllPermissions) {
    return requiredPermissions.every(hasPermission)
  }
  return requiredPermissions.some(hasPermission)
}

const createAuthorizeMiddleware = ({
  requiredPermissions = [],
  options = {
    requireAllPermissions: true,
  },
}: {
  requiredPermissions?: Authz[]
  options?: AuthorizeMiddlewareOptions
}) =>
  t.middleware(async ({ ctx, next }) => {
    const { session } = ctx

    if (!session) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User is not authenticated',
      })
    }

    // upsert user
    const user = await ctx.db.user.upsert({
      where: {
        authId: session.user.sub as string,
      },
      create: {
        authId: session.user.sub as string,
        email: (session.user.email as string) ?? '',
        firstName: (session.user.given_name as string) ?? '',
        lastName: (session.user.family_name as string) ?? '',
        image: (session.user.picture as string) ?? '',
      },
      update: {
        image: (session.user.picture as string) ?? '',
      },
    })

    const userPermissions = getRolePermissions(user.role)

    const userHasRequiredPermissions = getAuthzStatus({
      permissions: userPermissions,
      requiredPermissions,
      options,
    })

    if (!userHasRequiredPermissions) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'User does not have the required permissions',
      })
    }

    return next({
      ctx: {
        ...ctx,
        session,
        user,
        userPermissions,
      },
    })
  })

export const protectedProcedure = (
  requiredPermissions?: Authz[],
  options?: AuthorizeMiddlewareOptions,
) =>
  t.procedure.use(createAuthorizeMiddleware({ requiredPermissions, options }))
