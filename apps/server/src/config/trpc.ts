import {
  getAuthzStatus,
  verifyToken,
  type AuthorizeMiddlewareOptions
} from '@middleware/auth';
import { getUserDetails, type RateLimiter } from '@middleware/rateLimiter';
import { type Authz } from '@simplify-aviation/shared/auth';
import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { getUser } from 'api/user/service';
import { type Request } from 'express';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { prisma } from './db';

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 */

export const createContext = ({ req, res }: CreateExpressContextOptions) => ({
  req,
  res,
  db: prisma
});

type TRPCContext = Awaited<ReturnType<typeof createContext>>;

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

export const trpc = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    let { message } = shape;
    let zodError = null;

    if (error.cause instanceof ZodError) {
      zodError = error.cause.flatten();
      message = error.cause.errors.map((issue) => `${issue.message}`).join(', ');
    }

    return {
      ...shape,
      message,
      data: {
        ...shape.data,
        zodError
      }
    };
  }
});

export const publicProcedure = trpc.procedure;

const createAuthorizeMiddleware = ({
  requiredPermissions = [],
  options = {
    requireAllPermissions: true
  }
}: {
  requiredPermissions?: Authz[];
  options?: AuthorizeMiddlewareOptions;
}) =>
  trpc.middleware(async ({ ctx, next }) => {
    const token = ctx.req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User is not authenticated'
      });
    }

    try {
      const payload = verifyToken(token, 'access');

      const user = await getUser(payload.sub);

      if (!user || !user.active || user.deleted) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'User is not authenticated'
        });
      }

      const userHasRequiredPermissions = getAuthzStatus({
        permissions: [...user.permissions],
        requiredPermissions,
        options
      });

      if (!userHasRequiredPermissions) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'User does not have the required permissions'
        });
      }

      return next({
        ctx: {
          ...ctx,
          user
        }
      });
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User is not authenticated'
      });
    }
  });

export const rateLimitedMiddleware = (
  rateLimiter: RateLimiter,
  getKey?: (req: Request) => string
) =>
  trpc.middleware(async ({ ctx, next }) => {
    try {
      const ip = getKey ? getKey(ctx.req) : getUserDetails(ctx.req).ipAddress;

      await rateLimiter(ip);
    } catch (error) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests'
      });
    }

    return next();
  });

export const protectedProcedure = (
  requiredPermissions?: Authz[],
  options?: AuthorizeMiddlewareOptions
) => trpc.procedure.use(createAuthorizeMiddleware({ requiredPermissions, options }));
