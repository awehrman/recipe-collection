import { AuthenticationError } from 'apollo-server-micro';
import { getSession } from 'next-auth/client';

import { PrismaContext } from '../context';
import { downloadNotes } from './evernote';

export const createNotes = async (ctx, notes) => {
	const { prisma } = ctx;
	// save note data to db
	const resolveNotes = notes.map(async (note) => {
		if (!note || !note.content || !note.title) {
			throw new Error('Could not create note!');
		}
		const data = {
			// TODO come back to categories and tags
			content: note.content,
			evernoteGUID: note.evernoteGUID,
			image: note.image,
			source: note.source,
			title: note.title,
		};

		const saved = await prisma.note.create({ data })
			.catch(err => { throw err });

		return {
			__typename: 'Note',
      ...saved,
		};
	});

	const noteRes = await Promise.all(resolveNotes);
	return noteRes;
};

export const importNotes = async (_parent: unknown, _args: unknown, ctx: PrismaContext) => {
  const { req } = ctx;
  // TODO consider throwing this in a helper
  const session = await getSession({ req });
  const { evernoteAuthToken, evernoteExpiration } = session?.user ?? {};
  const isExpired = !!(Date.now() > parseInt(`${evernoteExpiration}`));
  const isAuthenticated = !!(evernoteAuthToken && !isExpired);

  const response = {
    error: null,
    notes: [],
  };

  if (!isAuthenticated) {
    throw new AuthenticationError('Evernote is not authenticated');
  }

  response.notes = await downloadNotes(ctx)
    .catch(err => {
      response.error = err.message;
    });

  return response;
}