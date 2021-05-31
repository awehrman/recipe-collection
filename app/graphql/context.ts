import { PrismaClient } from '@prisma/client';
import { IncomingMessage, ServerResponse } from 'http';

const prisma = new PrismaClient();

export interface Context {
  prisma: PrismaClient;
}

export type PrismaContext = {
  prisma?: PrismaClient;
  req?: IncomingMessage;
  res?: ServerResponse;
}

export async function contextResolver(ctx: PrismaContext): Promise<PrismaContext> {
  ctx.prisma = prisma;
  return ctx;
}
