import { GET_NOTE_CONTENT_FIELDS } from '../graphql/fragments';
import { getEvernoteNotes } from './evernote';
import { saveImages } from './images';

export const downloadNotes = async (ctx) => {
	console.log('downloadNotes'.magenta);

	// fetch new note content from evernote
	const notes = await getEvernoteNotes(ctx)
		// minify and upload image data
		.then(async (data) => saveImages(data))
		// save note data to db
		// eslint-disable-next-line no-use-before-define
		.then(async (data) => createNotes(ctx, data))
		.catch((err) => console.log(err));

	return notes;
};

export const createNotes = async (ctx, notes) => {
	console.log('createNotes'.magenta);
	// save note data to db

	const resolveNotes = notes.map(async (note) => {
		const data = {
			// TODO come back to categories and tags
			content: note.content,
			evernoteGUID: note.evernoteGUID,
			image: note.image,
			source: note.source,
			title: note.title,
		};

		const saved = await ctx.prisma.createNote({ ...data }).$fragment(GET_NOTE_CONTENT_FIELDS)
			.catch((err) => console.log(err));

		return {
			__typename: 'Note',
			...saved,
		};
	});

	const noteRes = await Promise.all(resolveNotes)
		.catch((err) => console.log(err));

	return noteRes;
};

export default {
	downloadNotes,
	createNotes,
};
