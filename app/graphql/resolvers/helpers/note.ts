import { Prisma, PrismaClient } from '@prisma/client';
import Evernote from 'evernote';
import { IncomingMessage } from 'http';
import _ from 'lodash';
import { getSession } from 'next-auth/client';

import { Note } from '../../../types/note';

import { PrismaContext } from '../../context';
import { fetchNotesMeta } from '../evernote';

import { buildIngredientLines, updateIngredientLineRelation } from './ingredients';

export const saveNote = async (
  note: Note,
  prisma: PrismaClient
): Promise<Note> => {
  // TODO this a pretty dumb check; will want to replace this with _.every
  const isCreateInstructions = note.instructions?.[0]?.id === undefined;

  const instructions: Prisma.InstructionLineUpdateManyWithoutNoteInput =
    isCreateInstructions
      ? {
          create: _.map(note.instructions, ({ blockIndex, reference }) => ({
            blockIndex,
            reference,
          })),
        }
      : {
          update: _.map(note.instructions, ({ id, blockIndex, reference }) => ({
            where: { id },
            data: { blockIndex, reference }, // ? updatedAt
          })),
        };

  const ingredients: Promise<Prisma.IngredientLineUpdateManyWithoutNoteInput> =
    await buildIngredientLines(note.ingredients, prisma);

  const noteResult = await prisma.note.update({
    data: {
      // TODO eventually we'll add in the ability to edit these
      // title: note.title,
      // source: note.source,
      // // categories?:
      // // tags?:
      image: note.image,
      content: note.content,
      isParsed: true,
      instructions,
      ingredients,
    },
    where: { id: note.id },
  });

  const updatedInstructions = await prisma.instructionLine.findMany({
    where: { noteId: note.id },
  });

  const updatedIngredients = await prisma.ingredientLine.findMany({
    where: { noteId: note.id },
    select: {
      id: true,
      reference: true,
      parsed: {
        select: {
          ingredientId: true,
        },
      },
    },
  });

  // TODO again this is going to need to be updated for multi ingredient lines
  await Promise.all(
    updatedIngredients.map((line) => updateIngredientLineRelation(line, prisma))
  );

  // TODO we don't actually need to pass this shit back. lets just re-query
  return {
    ...noteResult,
    ingredients: updatedIngredients,
    instructions: updatedInstructions,
  };
};

export const incrementOffset = async (
  req: IncomingMessage,
  prisma: PrismaClient,
  increment = 1
) => {
  const session = await getSession({ req });
  const { userId, noteImportOffset } = session?.user ?? {};
  const id = Number(userId);

  if (
    noteImportOffset !== undefined &&
    !isNaN(+noteImportOffset) &&
    !isNaN(+increment)
  ) {
    if (prisma?.user) {
      await prisma.user.update({
        data: { noteImportOffset: +noteImportOffset + +increment },
        where: { id },
      });
    }
    return noteImportOffset;
  }
};

// TODO we might need to check this over when it fails
export const validateNotes = async (
  ctx: PrismaContext,
  _store: Evernote.NoteStoreClient,
  notes: Evernote.NoteStore.NoteMetadata[]
): Promise<Evernote.NoteStore.NoteMetadata[]> => {
  const { prisma } = ctx;
  const evernoteGUID: string[] = notes.map((m) => `${m.guid}`);
  // check that these notes aren't already imported or staged
  const existing = await prisma.note.findMany({
    where: {
      evernoteGUID: {
        in: [...evernoteGUID],
      },
    },
  });

  // return these notes if they don't exist
  if (existing.length === 0) {
    return notes;
  }

  return fetchNotesMeta(ctx);
};
