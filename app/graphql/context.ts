import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Context {
  prisma: PrismaClient;
}

export async function contextResolver(ctx: Context): Promise<Context> {
  ctx.prisma = prisma;
  return ctx;
}
