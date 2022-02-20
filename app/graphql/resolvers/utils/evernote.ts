import Evernote from 'evernote';
import { getSession } from 'next-auth/client';

import { saveImages } from './image';
import { createNotes } from './note';

export const downloadNotes = async (ctx) => {
	const { req } = ctx;
	// fetch new note content from evernote
	const notes = await getEvernoteNotes(ctx)
		// minify and upload image data
		.then(async (data) => saveImages(data))
		// save note data to db
		.then(async (data) => createNotes(ctx, data))
		.catch((err) => console.log(err));

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

export const getEvernoteNotes = async (ctx) => {
	const { req } = ctx;
  const { evernoteAuthToken, offset = 0 } = await getSession({ req });

	const store = await getEvernoteNoteStore(req, evernoteAuthToken);

	const notesRes = await getNotesMetadata(store, offset)
		// ensure that these are new notes; refetch meta until newness is achieved
		.then(async (meta) => validateNotes(ctx, store, meta))
		// fetch the remaining note content and images for the new notes
		.then(async (newNotes) => getNotesData(store, newNotes))
		.catch((err) => { throw err; });

	return notesRes;
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
		.catch((err) => { throw err });

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
  .catch((err) => { throw err });

	return notesRes;
};

const getNotesMetadata = async (store, offset) => {
	// sadly evernote doesn't let us filter by anything not in a tag group
	const filter = new Evernote.NoteStore.NoteFilter();
	const maxResults = 1; // process.env.DOWNLOAD_LIMIT;
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

	const noteRes = await store.findNotesMetadata(filter, offset, maxResults, spec)
		// return only what we need
		.then(({ notes }) => notes.map((n) => ({
			categories: [ n.notebookGuid ],
			evernoteGUID: n.guid,
			source: n.attributes.sourceURL,
			tags: (n.tagGuids) ? [ ...n.tagGuids ] : null,
			title: n.title,
		})))
    .catch((err) => { throw err });

	return noteRes;
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
      //     .catch((err) => { throw err; });

      //   const combined = existingNotes.concat(existingRecipes)
      //     .map((e) => ({
      //       evernoteGUID: e.evernoteGUID,
      //       title: e.title, // debug only
      //     }));
      //   return combined;
      // })
      .catch((err) => { throw err });

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
		.catch((err) => { throw err });
};