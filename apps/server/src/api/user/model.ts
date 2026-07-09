import { prisma } from '@config/db';

export const loadUser = async (authId: string) =>
  prisma.user.findUnique({
    select: {
      id: true,
      email: true,
      firstName: true,
      image: true,
      lastName: true,
      role: true,
      authId: true,
      deleted: true,
      xeroEmployeeId: true
    },
    where: {
      authId
    }
  });

export const upsertUser = async ({
  authId,
  email,
  firstName,
  lastName,
  image
}: {
  authId: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
}) =>
  prisma.user.upsert({
    where: {
      authId
    },
    create: {
      authId,
      email,
      firstName,
      lastName,
      image
    },
    update: {
      image,
      email,
      firstName,
      lastName
    }
  });

export const updateActiveTime = async ({ authId }: { authId: string }) =>
  prisma.user.update({
    where: {
      authId
    },
    data: {
      lastActive: new Date()
    }
  });
