// @ts-nocheck
import Evernote from 'evernote';
import { getSession } from 'next-auth/client';

import { saveImages } from './image';
import { createNotes } from './note';

const filter = new Evernote.NoteStore.NoteFilter();
const maxResults = process.env.DOWNLOAD_LIMIT;
const spec = new Evernote.NoteStore.NotesMetadataResultSpec({
	includeTitle: true,
	includeContentLength: false,
	includeCreated: false,
	includeUpdated: false,
	includeDeleted: false,
	includeUpdateSequenceNum: false,
	includeNotebookGuid: true,
	includeTagGuids: true,
	includeAttributes: true,
	includeLargestResourceMime: false,
	includeLargestResourceSize: false,
});

export const downloadNotes = async (ctx) => {
	const { req } = ctx;
	// fetch new note content from evernote
	const notes = await getEvernoteNotes(ctx)
		// minify and upload image data
		.then(async (data) => saveImages(data))
		// save note data to db
		.then(async (data) => createNotes(ctx, data))

	// increment the notes offset in our session
	if (notes.length > 0) {
		await incrementOffset(req, notes.length);
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

	if (client) {return client;}
	throw new Error('Could not create Evernote client!');
};

const getEvernoteNotes = async (ctx) => {
	const { req } = ctx;
  const { evernoteAuthToken, offset = 0 } = await getSession({ req });
	console.log({ offset });
	const store = await getEvernoteNoteStore(req, evernoteAuthToken)
		.catch((err) => {
			throw new Error(`Could not connect to Evernote. ${err}`)
		});

	const response = await getNotesMetadata(store, offset)
		// ensure that these are new notes; refetch meta until newness is achieved
		.then(async (meta) => validateNotes(ctx, store, meta))
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
	const spec = new Evernote.NoteStore.NoteResultSpec({
		includeContent: true,
		includeResourcesData: true,
		includeResourcesRecognition: false,
		includeResourcesAlternateData: false,
		includeSharedNotes: false,
		includeNoteAppDataValues: true,
		includeResourceAppDataValues: true,
		includeAccountLimits: false,
	});

	const noteContent = await store.getNoteWithResultSpec(guid, spec)
		// minify and upload image
		.then((data) => {
			const { content, resources } = data;
			if (!resources) {
				throw new Error(`No image for ${guid}!`);
			}
			const image = resources?.[0]?.data?.body || null;
			return {
				evernoteGUID: guid,
				content,
				image,
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

	const notesRes = await Promise.all(resolveContent)

	return notesRes;
};

const getNotesMetadata = async (store, offset) => {
	const response = await store.findNotesMetadata(filter, offset, maxResults, spec)
		.then(({ notes }) => notes.map((note) => ({
			categories: [ note.notebookGuid ],
			evernoteGUID: note.guid,
			source: note.attributes.sourceURL,
			tags: (note.tagGuids) ? [ ...note.tagGuids ] : null,
			title: note.title,
		})))
		.catch((err) => {
			throw new Error(`Could not fetch notes metadata. ${err}`);
		})

	return response;
};

const incrementOffset = async (req, increment = 1) => {
	const session = await getSession({ req });
  session.offset += increment;
};

const validateNotes = async (ctx, store, notes) => {
  const { req, prisma } = ctx;

	const evernoteGUID = notes.map((m) => m.evernoteGUID);
	// check that these notes aren't already imported or staged
	// check existing notes for this guid
    const existing = await prisma.note.findMany({ where: { evernoteGUID: { in: [ ...evernoteGUID ] } } })
      // check existing recipes for this guid
      // .then(async (existingNotes) => {
      //   const existingRecipes = await ctx.prisma.recipes({ where: { evernoteGUID_in } })
      //     .$fragment(GET_EVERNOTE_GUID)

      //   const combined = existingNotes.concat(existingRecipes)
      //     .map((e) => ({
      //       evernoteGUID: e.evernoteGUID,
      //       title: e.title, // debug only
      //     }));
      //   return combined;
      // })

		console.log({ existing });

    // return these notes if they don't exist
    if (existing.length === 0) {
      return notes;
    }

	const uniqueNotes = notes.filter((note) => !~existing.indexOf(note.evernoteGUID));
	console.log('incrementing offset and re-fetching');

	// increment the offset and fetch
	const increment = ((uniqueNotes.length - existing.length) === 0) ? 1 : (uniqueNotes.length - existing.length);
	// eslint-disable-next-line no-use-before-define
	const offset = incrementOffset(req, increment);

	return getNotesMetadata(store, offset)
		.then(async (m) => validateNotes(ctx, store, m))
};