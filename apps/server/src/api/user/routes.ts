import { cache } from '@config/cache';
import { protectedProcedure, trpc } from '@config/trpc';
import { authz } from '@dreams-built/shared/src/auth/permissions';
import { getViewableUsers } from '@dreams-built/shared/src/auth/roles';
import { updateUserSchema } from '@dreams-built/shared/src/schemas';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { updateActiveTime, upsertUser } from './model';
import { getUser } from './service';

export const userRouter = trpc.router({
  list: protectedProcedure().query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        image: true,
        lastName: true,
        authId: true,
        hourlyRate: true,
        lastActive: true,
        role: true
      },
      where: {
        deleted: false
      }
    });

    return getViewableUsers(new Set(ctx.user.permissions), users);
  }),
  get: protectedProcedure([authz.roles_view_employee])
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        select: {
          id: true,
          email: true,
          firstName: true,
          image: true,
          lastName: true,
          authId: true,
          hourlyRate: true,
          lastActive: true,
          role: true
        },
        where: {
          id: input,
          deleted: false
        }
      });

      if (getViewableUsers(new Set(ctx.user.permissions), [user]).length === 0) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this user'
        });
      }

      return user;
    }),
  update: protectedProcedure([authz.roles_update_user])
    .input(updateUserSchema)
    .mutation(async ({ ctx, input: { id, hourlyRate, firstName, lastName, role } }) => {
      const user = await ctx.db.user.findUniqueOrThrow({
        select: {
          id: true,
          email: true,
          firstName: true,
          image: true,
          lastName: true,
          authId: true,
          hourlyRate: true,
          lastActive: true,
          role: true
        },
        where: {
          id,
          deleted: false
        }
      });

      if (getViewableUsers(new Set(ctx.user.permissions), [user]).length === 0) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this user'
        });
      }

      await ctx.db.user.update({
        where: {
          id
        },
        data: {
          hourlyRate,
          firstName,
          lastName,
          role
        }
      });

      await cache().user.delete(user.authId);

      return user;
    }),
  profile: protectedProcedure()
    .input(
      z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().optional(),
        image: z.string().optional()
      })
    )
    .query(async ({ ctx, input }) => {
      const { user } = ctx;

      const isNewEmail = !user.email && !!input.email;
      const isNewImage = (!user.image && !!input.image) || user.image !== input.image;
      const isNewFirstName = !user.firstName && !!input.firstName;
      const isNewLastName = !user.lastName && !!input.lastName;

      if (isNewEmail || isNewImage || isNewFirstName || isNewLastName) {
        await upsertUser({
          authId: user.authId,
          email: isNewEmail ? (input.email ?? '') : user.email,
          firstName: isNewFirstName ? (input.firstName ?? '') : user.firstName,
          lastName: isNewLastName ? (input.lastName ?? '') : user.lastName,
          image: isNewImage ? (input.image ?? '') : user.image
        });
        await cache().user.delete(user.authId);

        const updatedUser = await getUser(user.authId);

        if (updatedUser.deleted) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'User is deleted'
          });
        }

        updateActiveTime({
          authId: user.authId
        });

        return updatedUser;
      }

      if (user.deleted) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'User is deleted'
        });
      }

      updateActiveTime({
        authId: user.authId
      });

      return user;
    })
});
