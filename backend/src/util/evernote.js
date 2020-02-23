import Evernote from 'evernote';
import { GET_EVERNOTE_GUID } from '../graphql/fragments';

const getClient = (token) => {
	if (!token) throw new Error('No access token provided for Evernote client!');
	const client = new Evernote.Client({
		token,
		sandbox: process.env.SANDBOX,
		china: process.env.CHINA,
	});

	if (client) return client;
	throw new Error('Could not create Evernote client!');
};

// TODO cache this or save this in the cache
const getEvernoteNoteStore = async (req, token) => {
	console.log('getEvernoteNoteStore'.yellow);
	if (!token) throw new Error('No access token provided!');
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
				console.log(`no resource for ${ guid }!`.red);
				throw new Error(`no image resource for ${ guid }!`);
			}
			const image = resources[0].data.body;
			return {
				evernoteGUID: guid,
				content,
				image,
			};
		})
		.catch((err) => { console.log(err); });

	return noteContent;
};

const getNotesData = async (store, notes) => {
	console.warn('getNotesData'.cyan);

	const resolveContent = notes.map(async (note) => {
		const { content, image } = await getNoteContent(store, note.evernoteGUID);
		return {
			...note,
			content,
			image,
		};
	});

	const notesRes = await Promise.all(resolveContent)
		.catch((err) => console.log(err));

	return notesRes;
};

const getNotesMetadata = async (store, offset) => {
	console.warn(`getNotesMetadata for offset ${ offset }`.cyan);
	// sadly evernote doesn't let us filter by anything not in a tag group
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

const validateNotes = async (ctx, store, notes) => {
	console.warn('validateNotes'.cyan);
	const { req } = ctx;

	// eslint-disable-next-line camelcase
	const evernoteGUID_in = notes.map((m) => m.evernoteGUID);

	// check that these notes aren't already imported or staged
	// check existing notes for this guid
	const existing = await ctx.prisma.notes({ where: { evernoteGUID_in } })
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
		.catch((err) => { throw err; });

	// return these notes if they don't exist
	if (existing.length === 0) {
		console.log('valid!'.green);
		return notes;
	}

	const uniqueNotes = notes.filter((note) => !~existing.indexOf(note.evernoteGUID));
	console.log('need to fetch more notes!!'.red);
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

export const getEvernoteNotes = async (ctx) => {
	console.warn('getEvernoteNotes'.yellow);
	const { req } = ctx;
	const { authToken, offset = 0 } = req.session;

	const store = await getEvernoteNoteStore(req, authToken);
	const notesRes = await getNotesMetadata(store, offset)
		// ensure that these are new notes; refetch meta until newness is achieved
		.then(async (meta) => validateNotes(ctx, store, meta))
		// fetch the remaining note content and images for the new notes
		.then(async (newNotes) => getNotesData(store, newNotes))
		.catch((err) => { console.log(err); });

	console.log('GET EVERNOTE NOTES DONE'.red);

	return notesRes;
};

// TODO this needs to take into account the number of existing notes the store so that it can properly reset
export const incrementOffset = (req, increment = 1) => {
	console.log(`incrementing offset by ${ increment }!!!`.yellow);
	req.session.offset = (!req.session.offset)
		? increment
		: (req.session.offset + increment);

	return req.session.offset;
};

export default {
	getEvernoteNotes,
	incrementOffset,
};
