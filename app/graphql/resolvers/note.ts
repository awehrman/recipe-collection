import { Note } from '@prisma/client';
import { AuthenticationError } from 'apollo-server-micro';

import { PrismaContext } from '../context';
import { isAuthenticated } from './helpers/evernote';
import { parseNotesContent, saveNotes } from './helpers/note';
import { downloadNotes } from './evernote';

type EvernoteResponseProps = {
  error?: string | null;
	notes?: Note[];
}

export const createNotes = async (ctx: PrismaContext, notes: Note[]): Promise<Note[]> => {
	const { prisma } = ctx;

	// save note data to db
	const resolveNotes = notes.map(async (note) => {
		if (!note || !note.content || !note.title) {
			throw new Error('Could not create note!');
		}
		const data = {
			content: note.content,
			evernoteGUID: note.evernoteGUID,
			image: note.image,
			source: note.source,
			title: note.title,
		};

		const noteResponse = await prisma.note.create({ data })
			.catch(err => {
				throw new Error(`Could not create prisma Note: ${err}`);
			});
			return noteResponse;
	});

	const noteRes = await Promise.all(resolveNotes);
	return noteRes;
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

  const response:EvernoteResponseProps = {};

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
  const response:EvernoteResponseProps = {};
	const { prisma } = ctx;

	try {
		const notes: Note[] = await prisma.note.findMany()
			.then(parseNotesContent)
			.then((notes) => saveNotes(notes, prisma));
		console.log('updated:', notes?.[0]?.instructions);
			// TODO we really don't even need to pass this back if we're just going to refetch
		response.notes = [...notes];
	} catch (err) {
		response.error = `${err}`;
	}
  return response;
};
