import { type Authz } from '@dreams-built/shared/src/auth/types';
import { checkJwt } from '@middleware/auth';
import { initTRPC, TRPCError } from '@trpc/server';
import { type CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { logWarning } from '@utils/logger';
import { upsertUser } from 'api/user/model';
import { getOptionalUser, getUser } from 'api/user/service';
import { LRUCache } from 'lru-cache';
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

// Configure the LRU cache for rate limiting.
// The cache stores an object with the request count and expiry for each IP.
const rateLimitCache = new LRUCache<string, { count: number; expiry: number }>({
  max: 5000, // Maximum number of IP entries to store
  ttl: 60 * 1000 // Default time-to-live (60 seconds) in milliseconds
});

// Create the rate limiting middleware
const rateLimitMiddleware = trpc.middleware(async ({ ctx, next }) => {
  const ip = ctx.req.ip ?? 'unknown';

  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 10; // Maximum allowed requests per window

  let entry = rateLimitCache.get(ip);

  // Reset the entry if it doesn't exist or if the time window has expired
  if (!entry || now > entry.expiry) {
    entry = { count: 1, expiry: now + windowMs };
  } else {
    entry.count += 1;
  }

  // Update the cache with the current entry
  rateLimitCache.set(ip, entry);

  if (entry.count > maxRequests) {
    throw new TRPCError({
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests, please try again later.'
    });
  }

  return next();
});

export const publicProcedure = trpc.procedure.use(rateLimitMiddleware);

const authenticateUser = trpc.middleware(async ({ ctx, next }) => {
  const { req, res } = ctx;

  const checkJwtAsync = new Promise<void>((resolve, reject) => {
    checkJwt(req, res, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });

  try {
    await checkJwtAsync; // Waiting for the JWT check to complete
    return await next(); // Continue to the next middleware if the JWT check is successful
  } catch (error) {
    logWarning({ message: 'JWT check failed', error });
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User is not authenticated'
    });
  }
});

type AuthorizeMiddlewareOptions = {
  requireAllPermissions: boolean;
};

const getAuthzStatus = ({
  permissions,
  requiredPermissions,
  options
}: {
  permissions: string[];
  requiredPermissions: Authz[];
  options: AuthorizeMiddlewareOptions;
}) => {
  if (requiredPermissions.length === 0) return true;
  if (permissions.length === 0) return false;

  const hasPermission = (permission: Authz) => permissions.includes(permission);

  if (options.requireAllPermissions) return requiredPermissions.every(hasPermission);
  return requiredPermissions.some(hasPermission);
};

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
    const authId = ctx.req.auth?.payload.sub;

    if (!authId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'User is not authenticated'
      });
    }

    const optionalUser = await getOptionalUser(authId);

    if (!optionalUser) {
      await upsertUser({
        authId,
        email: ctx.req.auth?.payload.email as string,
        firstName: ctx.req.auth?.payload.given_name as string,
        lastName: ctx.req.auth?.payload.family_name as string,
        image: ctx.req.auth?.payload.picture as string
      });
    }

    try {
      const user = await getUser(authId);

      if (!user || user.deleted) {
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

export const protectedProcedure = (
  requiredPermissions?: Authz[],
  options?: AuthorizeMiddlewareOptions
) =>
  trpc.procedure
    .use(authenticateUser)
    .use(createAuthorizeMiddleware({ requiredPermissions, options }));
