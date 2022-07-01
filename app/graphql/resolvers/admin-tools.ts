import { PrismaContext } from '../context';

import { ImportedNote, Note } from '../../types/note';

// TODO move this into /types
type EvernoteResponseProps = {
  error?: string | null;
  notes?: ImportedNote[] | Note[];
};

export const resetDatabase = async (
  _root: unknown, // TODO look this up
  _args: unknown, // TODO look this up
  ctx: PrismaContext
): Promise<EvernoteResponseProps> => {
  const response: EvernoteResponseProps = {};
  const { prisma } = ctx;

  try {
    await prisma.instructionLine.deleteMany({});
    await prisma.parsedSegment.deleteMany({});
    await prisma.ingredientLine.deleteMany({});
    await prisma.ingredient.deleteMany({});
    await prisma.note.deleteMany({});
    await prisma.recipe.deleteMany({});
    // await prisma.category.deleteMany({});
    // await prisma.tag.deleteMany({});
  } catch (err) {
    console.log({ err });
    response.error = `${err}`;
  }
  return response;
};
