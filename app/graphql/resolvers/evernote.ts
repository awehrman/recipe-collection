import { Note, PrismaClient } from '@prisma/client';
import Evernote from 'evernote';
import { IncomingMessage } from 'http';
import { getSession } from 'next-auth/client';

import { metadataSpec, noteSpec } from '../../constants/evernote-specs';
import { PrismaContext } from '../context';

import { saveImages } from './image';
import { createNotes } from './note';

type PreSaveNote = {
  evernoteGUID: string
  title: string
  source: string | null
  // categories: string[]
  // tags: string[]
  // image: string | null
  // content: string | null
  isParsed: boolean
}

type NoteContentProps = {
  evernoteGUID: string;
  content: string;
  image: string | null;
}

const filter = new Evernote.NoteStore.NoteFilter();
const maxResults = parseInt(`${process.env.DOWNLOAD_LIMIT}`) ?? 1;

export const downloadNotes = async (ctx: PrismaContext): Promise<Note[]> => {
  const { req, prisma } = ctx;

  // fetch new note content from evernote
  const notes = await getEvernoteNotes(ctx)
    // minify and upload image data
    .then(async (data) => saveImages(data))
    // save note data to db
    .then(async (data) => createNotes(ctx, data))
    .catch((err) => {
      throw new Error(`An error occurred in downloadNotes: ${err}`);
    });

  // increment the notes offset in our session
  if (notes.length > 0) {
    await incrementOffset(req, prisma, notes.length);
  }
  return notes;
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

const getEvernoteNotes = async (ctx: PrismaContext): Promise<PreSaveNote[]> => {
  const { req } = ctx;
  const session = await getSession({ req });
  const { evernoteAuthToken, noteImportOffset = 0 } = session?.user ?? {};

  const store = await getEvernoteNoteStore(req, evernoteAuthToken)
    .catch((err) => {
      throw new Error(`Could not connect to Evernote. ${err}`);
    });

  const response = await getNotesMetadata(ctx, store, noteImportOffset)
    // fetch the remaining note content and images for the new notes
    .then(async (newNotes: PreSaveNote[]) => getNotesData(store, newNotes))
    .catch((err) => {
      throw new Error(`Could not request metadata: ${err}`);
    });

  return response;
};

const getEvernoteNoteStore = async (
  req: IncomingMessage,
  token: string | undefined
): Promise<Evernote.NoteStoreClient> => {
  if (!token) {
    throw new Error('No access token provided!');
  }
  const client = getClient(token);
  const store = await client.getNoteStore();
  return store;
};

const getNoteContent = async (
  store: Evernote.NoteStoreClient,
  guid: string
): Promise<NoteContentProps> => {
  const noteContent = await store
    // get the actual note content
    .getNoteWithResultSpec(guid, noteSpec)
    // minify and upload image
    .then(({ content = '', resources }) => {
      if (!resources) {
        console.error('No image found for note ${guid}');
      }
      return {
        evernoteGUID: guid,
        content,
        image: resources?.[0]?.data?.body ?? null,
      };
    });

  return noteContent;
};

const getNotesData = async (store: Evernote.NoteStoreClient, notes: PreSaveNote[]): Promise<PreSaveNote[]> => {
  const resolveContent = notes.map(async (note) => {
    const { content, image } = await getNoteContent(store, note.evernoteGUID);
    return {
      ...note,
      content,
      image,
    };
  });

  const response = await Promise.all(resolveContent);
  console.log({ response });
  return response;
};

const getNotesMetadata = async (
  ctx: PrismaContext,
  store: Evernote.NoteStoreClient,
  offset: number
): Promise<PreSaveNote[]> => {
  const newNotes: Evernote.NoteStore.NoteMetadata[] = await store
    .findNotesMetadata(filter, offset, maxResults, metadataSpec)
    // ensure that we haven't saved these as notes or recipes yet
    .then(async (meta: Evernote.NoteStore.NotesMetadataList) => validateNotes(ctx, store, meta?.notes ?? []))
    .catch((err) => {
      throw new Error(`Could not fetch notes metadata. ${err}`);
    });

  const response = newNotes.map((note) => ({
    // categories: [ note.notebookGuid ], // TODO
    evernoteGUID: `${note.guid}`,
    isParsed: false,
    source: note.attributes?.sourceURL ?? null,
    // tags: (note.tagGuids) ? [ ...note.tagGuids ] : null, // TODO
    title: `${note.title}`,
  }));

  return response;
};

const incrementOffset = async (req: IncomingMessage, prisma: PrismaClient, increment = 1) => {
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

const validateNotes = async (
  ctx: PrismaContext,
  store: Evernote.NoteStoreClient,
  notes: Evernote.NoteStore.NoteMetadata[]
): Promise<Evernote.NoteStore.NoteMetadata[]> => {
  const { prisma } = ctx;
  const evernoteGUID: string[] = notes.map((m) => `${m.guid}`);
  // check that these notes aren't already imported or staged
  const existing = await prisma.note
    .findMany({ where: { evernoteGUID: { in: [...evernoteGUID] } } })
    // check existing recipes for this guid
    // .then(async (existingNotes: Evernote.NoteStore.NoteMetadata[]) => {
    //   // TODO
    //   const existingRecipes = await prisma.recipe.findMany({
    //     where: { evernoteGUID: { in: [...evernoteGUID] } },
    //   });
    //   console.log({ existingRecipes });
    //   // const combined = existingNotes.concat(existingRecipes)
    //   // .map((e) => ({
    //   // 	evernoteGUID: e.evernoteGUID,
    //   // 	title: e.title, // debug only
    //   // }));
    //   // return combined;
    // })
    // .catch((err) => {
    //   throw err;
    // });

  // return these notes if they don't exist
  if (existing.length === 0) {
    return notes;
  }

  // const uniqueNotes = notes.filter(
  //   (note) => !~existing.indexOf(note.evernoteGUID));
  // );

  // increment the offset and fetch
  const increment = 1;
  //   uniqueNotes.length - existing.length === 0
  //     ? 1
  //     : uniqueNotes.length - existing.length;
  // const offset = await incrementOffset(req, prisma, increment);
  return await getNotesMetadata(ctx, store, increment)
		.then((n) => validateNotes(ctx, store, n));
};
