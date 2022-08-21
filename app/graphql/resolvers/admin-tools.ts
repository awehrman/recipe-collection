import { PrismaContext } from '../context';

import { EvernoteResponse } from 'types/evernote';

export const resetDatabase = async (
  _root: unknown,
  _args: unknown,
  ctx: PrismaContext
): Promise<EvernoteResponse> => {
  const response: EvernoteResponse = {};
  const { prisma } = ctx;

  try {
    await prisma.instructionLine.deleteMany({});
    await prisma.parsedSegment.deleteMany({});
    await prisma.ingredientLine.deleteMany({});
    await prisma.ingredient.deleteMany({});
    await prisma.note.deleteMany({});
    await prisma.recipe.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.tag.deleteMany({});
  } catch (err) {
    response.error = `${err}`;
  }
  return response;
};
