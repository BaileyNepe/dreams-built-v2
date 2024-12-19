import { cache } from '@config/cache';
import { protectedProcedure, trpc } from '@config/trpc';
import { z } from 'zod';
import { upsertUser } from './model';
import { getUser } from './service';

export const userRouter = trpc.router({
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
      const isNewImage = !user.image && !!input.image;
      const isNewName =
        (!user.firstName && !!input.firstName) || (!user.lastName && !!input.lastName);

      if (isNewEmail || isNewImage || isNewName) {
        await upsertUser({
          authId: user.authId,
          email: isNewEmail ? (input.email ?? '') : user.email,
          firstName: isNewName ? (input.firstName ?? '') : user.firstName,
          lastName: isNewName ? (input.lastName ?? '') : user.lastName,
          image: isNewImage ? (input.image ?? '') : user.image
        });
        await cache().user.delete(user.authId);

        return getUser(user.authId);
      }

      return user;
    })
});
