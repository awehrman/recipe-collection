import { PrismaClient } from '@prisma/client';
import { AuthenticationError } from 'apollo-server-micro';
import { Session } from 'next-auth';
import { getSession } from 'next-auth/client';

import { PrismaContext } from '../context';
import { fetchNotesMeta, fetchNotesContent } from './evernote';

import { SessionUserProps } from '../../types/session';
import { EvernoteResponse } from '../../types/evernote';
import { Note } from '../../types/note';
import { isAuthenticated } from './helpers/authenticate-evernote';
import { parseNotes } from './helpers/parse';

export const getNotesMeta = async (
  _root: unknown,
  _args: unknown,
  ctx: PrismaContext
): Promise<EvernoteResponse> => {
  const { req } = ctx;
  const authenticated = isAuthenticated(req);

  if (!authenticated) {
    throw new AuthenticationError('Evernote is not authenticated');
  }

  const response: EvernoteResponse = {};

  try {
    const notes = await fetchNotesMeta(ctx);
    response.notes = notes;
  } catch (err) {
    response.error = `${err}`;
  }
  return response;
};

export const getNotesContent = async (
  _root: unknown,
  _args: unknown,
  ctx: PrismaContext
): Promise<EvernoteResponse> => {
  const { req } = ctx;
  const authenticated = isAuthenticated(req);

  if (!authenticated) {
    throw new AuthenticationError('Evernote is not authenticated');
  }

  const response: EvernoteResponse = {};

  try {
    const notes = await fetchNotesContent(ctx);
    response.notes = notes;
  } catch (err) {
    response.error = `${err}`;
  }
  return response;
};

export const getParsedNotes = async (
  _root: unknown,
  _args: unknown,
  ctx: PrismaContext
): Promise<EvernoteResponse> => {
  const { req, prisma } = ctx;
  const authenticated = isAuthenticated(req);

  if (!authenticated) {
    throw new AuthenticationError('Evernote is not authenticated');
  }

  const response: EvernoteResponse = {};

  try {
    const notes = await parseNotes(prisma);
    response.notes = notes;
  } catch (err) {
    console.log({ err });
    response.error = `${err}`;
  }
  return response;
};

const saveRecipe = async (
  note: unknown,
  prisma: PrismaClient,
  importedUserId: number
): Promise<void> => {
  const {
    categories = [],
    evernoteGUID,
    tags = [],
    title,
    source,
    image,
    ingredients,
    instructions,
  } = note;
  // we'll eventually expand this to include a book reference and/or a url
  // but we'll just throw strings in for the meantime
  const sources = [];
  console.log({ categories, tags });
  if (source) {
    sources.push(source);
  }
  await prisma.recipe.create({
    data: {
      importedUserId,
      evernoteGUID,
      title,
      sources,
      image,
      categories: {
        connect: categories,
      },
      tags: {
        connect: tags,
      },
      IngredientLine: {
        connect: ingredients,
      },
      InstructionLine: {
        connect: instructions,
      },
    },
  });
};

export const saveRecipes = async (
  _root: unknown,
  _args: unknown,
  ctx: PrismaContext
): Promise<EvernoteResponse> => {
  const response: EvernoteResponse = {};
  const { prisma, req } = ctx;
  const session: Session | null = await getSession({ req });
  const user: SessionUserProps = session?.user || {};
  const userId = Number(user.userId);

  try {
    // find all parsed notes
    const notes = await prisma.note.findMany({
      where: { isParsed: true },
      select: {
        id: true,
        evernoteGUID: true,
        title: true,
        source: true,
        image: true,
        ingredients: {
          select: {
            id: true,
          },
        },
        instructions: {
          select: {
            id: true,
          },
        },
        categories: {
          select: {
            id: true,
          },
        },
        tags: {
          select: {
            id: true,
          },
        },
      },
    });
    const noteIds = notes.map((note) => note.id);

    // create new recipes
    await Promise.all(notes.map((note) => saveRecipe(note, prisma, userId)));

    // remove notes
    await prisma.note.deleteMany({
      where: { id: { in: noteIds } },
    });
  } catch (err) {
    response.error = `${err}`;
  }
  return response;
};
