import { GET_NOTE_CONTENT_FIELDS } from '../graphql/fragments';
import { getEvernoteNotes, incrementOffset } from './evernote';
import { parseContent } from './parser';
import { createIngredientLines, createInstructions } from './recipes';
import { saveImages } from './images';

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

export const downloadNotes = async (ctx) => {
	console.log('downloadNotes'.magenta);
	const { req } = ctx;
	// fetch new note content from evernote
	const notes = await getEvernoteNotes(ctx)
		// minify and upload image data
		.then(async (data) => saveImages(data))
		// save note data to db
		// eslint-disable-next-line no-use-before-define
		.then(async (data) => createNotes(ctx, data))
		.catch((err) => console.log(err));

	// increment the notes offset in our session
	if (notes.length > 0) {
		await incrementOffset(req, notes.length);
	}
	return notes;
};

export const processNotes = async (ctx, notes, isCreateIngredient = false) => {
	console.log('processNotes'.magenta);
	// parse the dom content into ingredients and instructions objects
	const parsedNotes = notes.map((note) => parseContent(note));

	// then go through each note and save out their ingredient and instruction lines
	const resolveLines = parsedNotes.map(async (note) => {
		const { id } = note;
		const resolveIngredients = createIngredientLines(ctx, note.ingredients, isCreateIngredient);
		const resolveInstructions = createInstructions(ctx, note.instructions);

		const { ingredients, instructions } = await Promise.all([ resolveIngredients, resolveInstructions ])
			.then((ids) => ({
				ingredients: ids[0],
				instructions: ids[1],
			}))
			.catch((err) => { throw err; });

		return {
			id,
			ingredients,
			instructions,
		};
	});

	const notesRes = await Promise.all(resolveLines)
		.catch((err) => { throw err; });

	return notesRes;
};

export const updateNotes = async (ctx, notes) => {
	console.log('updateNotes'.magenta);
	console.log({ notes });
	const resolveNotes = notes.map(async (note) => {
		const data = {
			ingredients: { connect: note.ingredients },
			instructions: { connect: note.instructions },
		};
		delete data.id;
		console.log({ data });
		const saved = await ctx.prisma.updateNote({
			data,
			where: { id: note.id },
		}).$fragment(GET_NOTE_CONTENT_FIELDS)
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
	createNotes,
	downloadNotes,
	processNotes,
	updateNotes,
};
