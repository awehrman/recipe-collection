import { AuthenticationError } from 'apollo-server-micro';

import { PrismaContext } from '../context';
import { isAuthenticated } from './helpers/evernote';
// TODO rename downloadNotes vs getNotes to be more specific
import { fetchNotesMeta, fetchNotesContent } from './evernote';

import { ImportedNote, Note } from '../../types/note';

const { performance } = require('perf_hooks');

// TODO move this into /types
type EvernoteResponseProps = {
  error?: string | null;
  notes?: ImportedNote[] | Note[];
};

export const getNotesMeta = async (_root: unknown, _args: unknown, ctx: PrismaContext)
  : Promise<EvernoteResponseProps> => {
    const { req } = ctx;
    const authenticated = isAuthenticated(req);

    if (!authenticated) {
      throw new AuthenticationError('Evernote is not authenticated');
    }

    const response: EvernoteResponseProps = {};

    try {
      const t0 = performance.now();
      const notes = await fetchNotesMeta(ctx);
      const t1 = performance.now();
      console.log(`fetchNotesMeta took ${(t1 - t0).toFixed(2)} milliseconds.`);
      response.notes = notes;
    } catch (err) {
      console.log({ err });
      response.error = `${err}`;
    }
    return response;
  };

  export const getNotesContent = async (_root: unknown, _args: unknown, ctx: PrismaContext)
  : Promise<EvernoteResponseProps> => {
    const { req } = ctx;
    const authenticated = isAuthenticated(req);

    if (!authenticated) {
      throw new AuthenticationError('Evernote is not authenticated');
    }

    const response: EvernoteResponseProps = {};

    try {
      const t0 = performance.now();
      const notes = await fetchNotesContent(ctx);
      const t1 = performance.now();
      console.log(`[getNotesContent] took ${(t1 - t0).toFixed(2)} milliseconds.`);
      response.notes = notes;
    } catch (err) {
      console.log({ err });
      response.error = `${err}`;
    }
    return response;
  };

  // deprecated
// export const importNotes = async (
//   _root: unknown, // TODO look this up
//   _args: unknown, // TODO look this up
//   ctx: PrismaContext
// ): Promise<EvernoteResponseProps> => {
//   const { req } = ctx;
//   const authenticated = isAuthenticated(req);

//   if (!authenticated) {
//     throw new AuthenticationError('Evernote is not authenticated');
//   }

//   const response: EvernoteResponseProps = {};

//   try {
//     const notes = await downloadNotes(ctx);
//     response.notes = [...notes];
//   } catch (err) {
//     console.log({ err });
//     response.error = `${err}`;
//   }
//   return response;
// };

// deprecated
// export const parseNotes = async (
//   _root: unknown, // TODO look this up
//   _args: unknown, // TODO look this up
//   ctx: PrismaContext
// ): Promise<EvernoteResponseProps> => {
//   const response: EvernoteResponseProps = {};
//   const { prisma } = ctx;

//   try {
//     const notes: Note[] = await getNotes(prisma)
//       .then(parseNotesContent)
//       .then((notes: Note[]) => saveNotes(notes, prisma));
//     // TODO we really don't even need to pass this back if we're just going to refetch
//     // i guess decide on whether we want to just shove this into the cache on update or not
//     response.notes = [...notes];
//   } catch (err) {
//     console.log({ err });
//     response.error = `${err}`;
//   }
//   return response;
// };

// const saveRecipe = async (note, prisma: PrismaClient): Promise<void> => {
//   const { evernoteGUID, title, source, image, ingredients, instructions } = note;
//   // we'll eventually expand this to include a book reference and/or a url
//   // but we'll just throw strings in for the meantime
//   const sources = [source];
//   await prisma.recipe.create({
//     data: {
//       // TODO grab this off the session
//       importedUserId: 3,
//       evernoteGUID,
//       title,
//       sources,
//       image,
//       IngredientLine: {
//         connect: ingredients
//       },
//       InstructionLine: {
//         connect: instructions
//       }
//     }
//   });
// };

// export const saveRecipes = async (
//   _root: unknown, // TODO look this up
//   _args: unknown, // TODO look this up
//   ctx: PrismaContext
// ): Promise<EvernoteResponseProps> => {
//   const response: EvernoteResponseProps = {};
//   const { prisma } = ctx;

//   try {
//     // find all parsed notes
//     const notes = await prisma.note.findMany({
//       where: { isParsed: true },
//       select: {
//         // categories/tags
//         id: true,
//         evernoteGUID: true,
//         title: true,
//         source: true,
//         image: true,
//         ingredients: {
//           select: {
//             id: true
//           }
//         },
//         instructions: {
//           select: {
//             id: true
//           }
//         },
//       }
//     });
//     console.log(notes);
//     const noteIds = notes.map((note) => note.id);

//     // create new recipes
//     await Promise.all(notes.map((note) => saveRecipe(note, prisma)));

//     // remove notes
//     await prisma.note.deleteMany({
//       where: { id: { in: noteIds } }
//     });
//   } catch (err) {
//     console.log({ err });
//     response.error = `${err}`;
//   }
//   return response;
// };
