import Evernote from 'evernote';
import { IncomingMessage } from 'http';
import { getSession } from 'next-auth/client';

export const getAuthorizedClient = (token: string | undefined): Evernote.Client => {
  if (!token) {
    throw new Error('No access token provided for Evernote client!');
  }
  const client = new Evernote.Client({
    token,
    sandbox: process.env.EVERNOTE_ENVIRONMENT === 'sandbox',
    china: false,
  });

  if (!client) {
    throw new Error('Could not create Evernote client!');
  }
  return client;
};

export const getEvernoteStore = async (
  req: IncomingMessage
): Promise<Evernote.NoteStoreClient> => {
  const session = await getSession({ req });
  const { evernoteAuthToken: token } = session?.user ?? {};
  const client = getAuthorizedClient(token);

  try {
    const store = await client.getNoteStore();
    return store;
  } catch (err) {
    throw new Error('Could not access Evernote store!');
  }
};

export default {
  getAuthorizedClient,
  getEvernoteStore,
};
