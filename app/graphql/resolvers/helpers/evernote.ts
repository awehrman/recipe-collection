import { PrismaClient } from '@prisma/client';
import Evernote from 'evernote';
import { IncomingMessage } from 'http';
import { getSession } from 'next-auth/client';

import { NoteMeta } from '../../../types/note';
import {
  METADATA_NOTE_SPEC,
  NOTE_FILTER,
  MAX_NOTES_LIMIT,
} from '../../../constants/evernote';
import { PrismaContext } from '../../context';

// export const createNotes = async (
//   ctx: PrismaContext,
//   notes: ImportedNote[]
// ): Promise<PrismaNote[]> => {
//   const { prisma } = ctx;

//   // save note data to db
//   const resolveNotes = notes.map(async (note) => {
//     if (!note || !note.content || !note.title) {
//       throw new Error('Could not create note!');
//     }
//     const data: Prisma.NoteUncheckedCreateInput = {
//       content: note.content,
//       evernoteGUID: note.evernoteGUID,
//       image: `${note?.image}`,
//       source: note?.source ?? null,
//       title: note.title,
//       isParsed: note.isParsed,
//     };

//     const noteResponse = await prisma.note.create({ data }).catch((err) => {
//       console.log({ err });
//       throw new Error(`Could not create prisma Note: ${err}`);
//     });
//     return noteResponse;
//   });

//   const noteRes = await Promise.all(resolveNotes);
//   return noteRes;
// };

// deprecated use getEvernoteStore instead
// export const getEvernoteNotes = async (
//   ctx: PrismaContext
// ): Promise<ImportedNote[]> => {
//   const { req } = ctx;
//   const session = await getSession({ req });
//   const { evernoteAuthToken, noteImportOffset = 0 } = session?.user ?? {};

//   const store = await getEvernoteNoteStore(req, evernoteAuthToken).catch(
//     (err) => {
//       throw new Error(`Could not connect to Evernote. ${err}`);
//     }
//   );

//   const response = await getNotesMetadata(ctx, store, noteImportOffset)
//     .catch((err) => {
//       throw new Error(`Could not request metadata: ${err}`);
//     });

//   return response;
// };

export const getEvernoteStore = async (
  req: IncomingMessage
): Promise<Evernote.NoteStoreClient> => {
  const session = await getSession({ req });
  const { evernoteAuthToken: token } = session?.user ?? {};
  const client = getClient(token);

  try {
    const store = await client.getNoteStore();
    return store;
  } catch (err) {
    throw new Error('Could not access Evernote store!');
  }
};

// const assignRelations = async (
//   note: PrismaNote,
//   prisma: PrismaClient
// ): Promise<Note> => {
//   const ingredients: IngredientLine[] = await prisma.ingredientLine.findMany({
//     where: { noteId: note.id }
//   });

//   const instructions: InstructionLine[] = await prisma.instructionLine.findMany(
//     {
//       where: { noteId: note.id },
//     }
//   );

//   const result: Note = {
//     ...note,
//     ingredients,
//     instructions,
//   };

//   return result;
// };

// export const getNotes = async (prisma: PrismaClient): Promise<Note[]> => {
//   // get all note content
//   const contents: PrismaNote[] = await prisma.note.findMany();

//   const resolveNoteRelations = async (note: PrismaNote): Promise<Note> =>
//     assignRelations(note, prisma);

//   // get the rest of the note relations
//   const notes = await Promise.all(contents.map(resolveNoteRelations));
//   return notes;
// };

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

export const isAuthenticated = async (
  req: IncomingMessage
): Promise<boolean> => {
  const session = await getSession({ req });
  const { evernoteAuthToken, evernoteExpiration } = session?.user ?? {};
  const isExpired = !!(Date.now() > parseInt(`${evernoteExpiration}`));
  const isAuthenticated = !!(evernoteAuthToken && !isExpired);
  return isAuthenticated;
};

const getClient = (token: string | undefined): Evernote.Client => {
  if (!token) {
    throw new Error('No access token provided for Evernote client!');
  }
  const client = new Evernote.Client({
    token,
    sandbox: !!process.env.SANDBOX,
    china: !!process.env.CHINA,
  });

  if (!client) {
    throw new Error('Could not create Evernote client!');
  }
  return client;
};

// const getEvernoteNoteStore = async (
//   req: IncomingMessage,
//   token: string | undefined
// ): Promise<Evernote.NoteStoreClient> => {
//   if (!token) {
//     throw new Error('No access token provided!');
//   }
//   const client = getClient(token);
//   const store = await client.getNoteStore();
//   return store;
// };

// const getNoteContent = async (
//   store: Evernote.NoteStoreClient,
//   guid: string
// ): Promise<EvernoteNoteContent> => {
//   const noteContent = await store
//     .getNoteWithResultSpec(guid, NOTE_SPEC)
//     .then(({ content = '', resources }) => {
//       if (!resources) {
//         console.error(`No image found for note ${guid}`);
//       }
//       return {
//         evernoteGUID: guid,
//         content,
//         image: resources?.[0]?.data?.body ?? null,
//         // TODO categories & tags
//       };
//     });
//   return noteContent;
// };

// export const getNotesContent = async (
//   store: Evernote.NoteStoreClient,
//   notes: NoteMeta[]
// ): Promise<ImportedNote[]> => {
//   const resolveContent = notes.map(async (note) => {
//     const { content, image } = await getNoteContent(store, note.evernoteGUID);

//     return {
//       ...note,
//       content,
//       image,
//     };
//   });

//   const response = await Promise.all(resolveContent);
//   return response;
// };

const getNotesMetadata = async (
  ctx: PrismaContext,
  store: Evernote.NoteStoreClient,
  offset: number
): Promise<NoteMeta[]> => {
  const notes: Evernote.NoteStore.NoteMetadata[] = await store
    .findNotesMetadata(NOTE_FILTER, offset, MAX_NOTES_LIMIT, METADATA_NOTE_SPEC)
    // ensure that we haven't saved these as notes or recipes yet
    .then(async (meta: Evernote.NoteStore.NotesMetadataList) =>
      validateNotes(ctx, store, meta?.notes ?? [])
    )
    .catch((err) => {
      throw new Error(`Could not fetch notes metadata. ${err}`);
    });

  const response = notes.map((note) => ({
    // categories: [ note.notebookGuid ], // TODO
    evernoteGUID: `${note.guid}`,
    isParsed: false,
    source: note?.attributes?.sourceURL ?? null,
    // tags: (note.tagGuids) ? [ ...note.tagGuids ] : null, // TODO
    title: `${note.title}`,
  }));

  return response;
};

// TODO we might need to check this over when it fails
export const validateNotes = async (
  ctx: PrismaContext,
  store: Evernote.NoteStoreClient,
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

  // increment the offset and fetch
  const increment = 1;

  return await getNotesMetadata(ctx, store, increment);
};

export default {
  getEvernoteStore,
  incrementOffset,
  isAuthenticated,
};
