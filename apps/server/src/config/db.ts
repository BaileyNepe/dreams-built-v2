import { PrismaClient } from '@prisma/client';
import { env } from './env';

const prisma = new PrismaClient({
  log: env.environment === 'development' ? ['warn', 'error'] : ['error']
});

export { prisma };
