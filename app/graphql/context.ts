import { PrismaClient } from '@prisma/client';
import { IncomingMessage, ServerResponse } from 'http';
import prisma from '../lib/prisma';

export interface Context {
  prisma: PrismaClient
  req: IncomingMessage
  res: ServerResponse
}

export type PrismaContext = {
  prisma: PrismaClient
  req: IncomingMessage
  res: ServerResponse
}

export async function contextResolver(ctx: PrismaContext): Promise<PrismaContext> {
  ctx.prisma = prisma;
  return ctx;
}
