// @ts-nocheck
import Evernote from 'evernote';
import { getSession } from 'next-auth/client';

import { saveImages } from './image';
import { createNotes } from './note';

const filter = new Evernote.NoteStore.NoteFilter();
const maxResults = process.env.DOWNLOAD_LIMIT;
const metadataSpec = new Evernote.NoteStore.NotesMetadataResultSpec({
	includeTitle: true,
	includeContentLength: false,
	includeCreated: false,
	includeUpdated: false,
	includeDeleted: false,
	includeUpdateSequenceNum: false,
	includeNotebookGuid: false,
	includeTagGuids: false,
	includeAttributes: true, // needed for source
	includeLargestResourceMime: false,
	includeLargestResourceSize: false,
});

const noteSpec = new Evernote.NoteStore.NoteResultSpec({
	includeContent: true,
	includeResourcesData: true,
	includeResourcesRecognition: false,
	includeResourcesAlternateData: false,
	includeSharedNotes: false,
	includeNoteAppDataValues: true,
	includeResourceAppDataValues: true,
	includeAccountLimits: false,
});

export const downloadNotes = async (ctx) => {
	const { req, prisma } = ctx;

	// fetch new note content from evernote
	const notes = await getEvernoteNotes(ctx)
		// minify and upload image data
		.then(async (data) => saveImages(data))
		// save note data to db
		.then(async (data) => createNotes(ctx, data))
		.catch((err) => { throw err });

	// increment the notes offset in our session
	if (notes.length > 0) {
		await incrementOffset(req, prisma, notes.length);
	}
	return notes;
};

const getClient = (token) => {
	if (!token) {throw new Error('No access token provided for Evernote client!');}
	const client = new Evernote.Client({
		token,
		sandbox: process.env.SANDBOX,
		china: process.env.CHINA,
	});

	if (!client) {
		throw new Error('Could not create Evernote client!');
	}
	return client;
};

const getEvernoteNotes = async (ctx) => {
	const { req } = ctx;
  const { evernoteAuthToken, noteImportOffset = 0 } = await getSession({ req });

	const store = await getEvernoteNoteStore(req, evernoteAuthToken)
		.catch((err) => {
			throw new Error(`Could not connect to Evernote. ${err}`)
		});

	const response = await getNotesMetadata(ctx, store, noteImportOffset)
		// fetch the remaining note content and images for the new notes
		.then(async (newNotes) => getNotesData(store, newNotes));

	return response;
};

const getEvernoteNoteStore = async (req, token) => {
	if (!token) {throw new Error('No access token provided!');}
	const client = getClient(token);
	const store = await client.getNoteStore();
	return store;
};

const getNoteContent = async (store, guid) => {
	const noteContent = await store.getNoteWithResultSpec(guid, noteSpec)
		// minify and upload image
		.then((data) => {
			const { content, resources } = data;
			// if (!resources) {
			// 	throw new Error(`No image for ${guid}!`);
			// }
			return {
				evernoteGUID: guid,
				content,
				image: resources?.[0]?.data?.body,
			};
		})

	return noteContent;
};

const getNotesData = async (store, notes) => {
	const resolveContent = notes.map(async (note) => {
		const { content, image } = await getNoteContent(store, note.evernoteGUID);
		return {
			...note,
			content,
			image,
		};
	});

	const response = await Promise.all(resolveContent)
	return response;
};

const getNotesMetadata = async (ctx, store, offset) => {
	const newNotes = await store.findNotesMetadata(filter, offset, maxResults, metadataSpec)
		// ensure that we haven't saved these as notes or recipes yet
		.then(async (meta) => validateNotes(ctx, store, meta?.notes || []))
		.catch((err) => {
			throw new Error(`Could not fetch notes metadata. ${err}`);
		});

	const response = newNotes.map((note) => ({
		// categories: [ note.notebookGuid ], // skip
		evernoteGUID: note.guid,
		source: note.attributes.sourceURL,
		// tags: (note.tagGuids) ? [ ...note.tagGuids ] : null, // skip
		title: note.title,
	}))

	return response;
};

const incrementOffset = async (req, prisma, increment = 1) => {
	const session = await getSession({ req });
	const id = Number(session.user.userId);
	if (!isNaN(+session.user.noteImportOffset) && !isNaN(+increment)) {
		const noteImportOffset = +session.user.noteImportOffset + +increment;
		if (prisma?.user) {
			await prisma.user.update({
				data: { noteImportOffset },
				where: { id },
			});
		}
		return noteImportOffset;
	}
};

const validateNotes = async (ctx, store, notes = []) => {
  const { req, prisma } = ctx;
	const evernoteGUID = notes.map((m) => m.evernoteGUID);
	// check that these notes aren't already imported or staged
	const existing = await prisma.note.findMany({ where: { evernoteGUID: { in: [ ...evernoteGUID ] } } })
		// check existing recipes for this guid
		.then(async (existingNotes = []) => {
			const existingRecipes = await prisma.recipe.findMany({
				where: { evernoteGUID: { in: [ ...evernoteGUID ] } }
			});
			const combined = existingNotes.concat(existingRecipes)
				// .map((e) => ({
				// 	evernoteGUID: e.evernoteGUID,
				// 	title: e.title, // debug only
				// }));
			return combined;
		})
		.catch(err => { throw err; });


	// return these notes if they don't exist
	if (existing.length === 0) {
		return notes;
	}

	const uniqueNotes = notes.filter((note) => !~existing.indexOf(note.evernoteGUID));

	// increment the offset and fetch
	const increment = ((uniqueNotes.length - existing.length) === 0) ? 1 : (uniqueNotes.length - existing.length);
	const offset = await incrementOffset(req, prisma, increment);
	return await getNotesMetadata(store, offset)
		.then((n) => validateNotes(ctx, store, n));
};
