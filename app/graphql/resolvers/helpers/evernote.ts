import { PrismaClient } from '@prisma/client';
import Evernote from 'evernote';
import { IncomingMessage } from 'http';
import { getSession } from 'next-auth/client';

import { fetchNotesMeta } from '../evernote';
import { PrismaContext } from '../../context';

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
    sandbox: Boolean(process.env.SANDBOX),
    china: Boolean(process.env.CHINA),
  });

  if (!client) {
    throw new Error('Could not create Evernote client!');
  }
  return client;
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

  return fetchNotesMeta(ctx);
};

export default {
  getEvernoteStore,
  incrementOffset,
  isAuthenticated,
};
