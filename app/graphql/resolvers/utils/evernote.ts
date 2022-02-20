import Evernote from 'evernote';
import { getSession } from 'next-auth/client';

export const downloadNotes = async (ctx) => {
	console.log('downloadNotes');
	// const { req } = ctx;
	// fetch new note content from evernote
	const notes = await getEvernoteNotes(ctx)
		// minify and upload image data
		// .then(async (data) => saveImages(data))
		// save note data to db
		// .then(async (data) => createNotes(ctx, data))
		.catch((err) => console.log(err));

	// increment the notes offset in our session
	if (notes.length > 0) {
		// await incrementOffset(req, notes.length);
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
	console.warn('getEvernoteNotes', { ctx });
	const { req } = ctx;
  const { evernoteAuthToken, offset = 0 } = await getSession({ req });

	const store = await getEvernoteNoteStore(req, evernoteAuthToken);

	const notesRes = await getNotesMetadata(store, offset)
		// ensure that these are new notes; refetch meta until newness is achieved
		.then(async (meta) => validateNotes(ctx, store, meta))
		// fetch the remaining note content and images for the new notes
		// .then(async (newNotes) => getNotesData(store, newNotes))
		.catch((err) => { console.log(err); });

	return notesRes;
};

const getEvernoteNoteStore = async (req, token) => {
	console.log('getEvernoteNoteStore');
	if (!token) {throw new Error('No access token provided!');}
	const client = getClient(token);
	const store = await client.getNoteStore();
	return store;
};

const getNotesMetadata = async (store, offset) => {
	console.warn(`getNotesMetadata for offset ${ offset }`);
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
		.catch((err) => { console.log(err); });

	return noteRes;
};

const GET_EVERNOTE_GUID = `
	{
		evernoteGUID
		title
		id
	}
`;

const incrementOffset = async (req, increment = 1) => {
	const session = await getSession({ req });
  session.offset += increment;
};

const validateNotes = async (ctx, store, notes) => {
  const { req, prisma } = ctx;
	console.warn('validateNotes', { ctx });

	// eslint-disable-next-line camelcase
	const evernoteGUID_in = notes.map((m) => m.evernoteGUID);

	// check that these notes aren't already imported or staged
	// check existing notes for this guid
    const existing = await prisma.notes({ where: { evernoteGUID_in } })
      .$fragment(GET_EVERNOTE_GUID)
      // check existing recipes for this guid
      .then(async (existingNotes) => {
        const existingRecipes = await ctx.prisma.recipes({ where: { evernoteGUID_in } })
          .$fragment(GET_EVERNOTE_GUID)
          .catch((err) => { throw err; });

        const combined = existingNotes.concat(existingRecipes)
          .map((e) => ({
            evernoteGUID: e.evernoteGUID,
            title: e.title, // debug only
          }));
        return combined;
      })
      .catch((err) => { console.log(err) });

    // return these notes if they don't exist
    if (existing.length === 0) {
      console.log('valid!');
      return notes;
    }

	const uniqueNotes = notes.filter((note) => !~existing.indexOf(note.evernoteGUID));
	console.log('need to fetch more notes!!');
	console.log({
		existing,
		uniqueNotes: uniqueNotes.map((n) => `${ n.evernoteGUID }_${ n.title }`),
	});

	// increment the offset and fetch
	const increment = ((uniqueNotes.length - existing.length) === 0) ? 1 : (uniqueNotes.length - existing.length);
	// eslint-disable-next-line no-use-before-define
	const offset = incrementOffset(req, increment);

	return getNotesMetadata(store, offset)
		.then(async (m) => validateNotes(ctx, store, m))
		.catch((err) => { console.log(err); });
};