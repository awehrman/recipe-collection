import { AuthenticationError } from 'apollo-server-micro';

import { PrismaContext } from '../context';
import { isAuthenticated, getNotes } from './helpers/evernote';
import { parseNotesContent, saveNotes } from './helpers/note';
// TODO rename downloadNotes vs getNotes to be more specific
import { downloadNotes } from './evernote';

import { ImportedNote, Note } from '../../types/note';

// TODO move this into /types
type EvernoteResponseProps = {
  error?: string | null;
  notes?: ImportedNote[] | Note[];
};

export const importNotes = async (
  _root: unknown, // TODO look this up
  _args: unknown, // TODO look this up
  ctx: PrismaContext
): Promise<EvernoteResponseProps> => {
  const { req } = ctx;
  const authenticated = isAuthenticated(req);

  if (!authenticated) {
    throw new AuthenticationError('Evernote is not authenticated');
  }

  const response: EvernoteResponseProps = {};

  try {
    const notes = await downloadNotes(ctx);
    response.notes = [...notes];
  } catch (err) {
    response.error = `${err}`;
  }
  return response;
};

export const parseNotes = async (
  _root: unknown, // TODO look this up
  _args: unknown, // TODO look this up
  ctx: PrismaContext
): Promise<EvernoteResponseProps> => {
  const response: EvernoteResponseProps = {};
  const { prisma } = ctx;

  try {
    const notes: Note[] = await getNotes(prisma)
      .then(parseNotesContent)
      .then((notes: ImportedNote[] | Note[]) => saveNotes(notes, prisma));
    // TODO we really don't even need to pass this back if we're just going to refetch
    // i guess decide on whether we want to just shove this into the cache on update or not
    response.notes = [...notes];
  } catch (err) {
    response.error = `${err}`;
  }
  return response;
};
