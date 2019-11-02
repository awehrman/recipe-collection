import Evernote from 'evernote';
import imagemin from 'imagemin';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminPngquant from 'imagemin-pngquant';
import fetch from 'node-fetch';

// move this into a util file
const getNoteStore = (token) => {
	console.log(token);
	const client = new Evernote.Client({
		token,
		sandbox: process.env.SANDBOX,
		china: process.env.CHINA,
	});

	const store = client.getNoteStore();
	return store;
}

const findNotesMeta = async (ctx, store, config) => {
	console.log('findNotesMeta'.cyan);
	const { filter, offset, totalCount } = config;
	console.log({ offset, totalCount });

	// limit the number of notes to lookup
	const maxResults = process.env.DOWNLOAD_LIMIT;

	// only include the stuff we care about
	const spec = new Evernote.NoteStore.NotesMetadataResultSpec({
		includeTitle: true, // <-- why not, you might want this for debugging purposes
		includeContentLength: false,
		includeCreated: false,
		includeUpdated: false,
		includeDeleted: false,
		includeUpdateSequenceNum: false,
		includeNotebookGuid: true,
		includeTagGuids: true, // <-- might want this for debugging purposes
		includeAttributes: true, // <-- we need this for the source URL
		includeLargestResourceMime: false,
		includeLargestResourceSize: false
	});

	const rejectedNoteCount = 0;
	console.log('fetching metadata...');
	const notes = await store.findNotesMetadata(filter, offset, maxResults, spec)
		.then(result => {
			const { notes } = result;
			const createNotes = notes
				// only grab valid notes
				.filter(n => {
					// reject note if we've already imported it
					const importedGUID = (process.env.SANDBOX)
						? process.env.SANDBOX_BOOKMARKED_NOTEBOOK_GUID
						: process.env.PROD_BOOKMARKED_NOTEBOOK_GUID;
					if (n.tagGuids && n.tagGuids.includes(importedGUID)) {
						rejectedNoteCount++;
						return false;
					}

					// reject note if its flagged as a bookmark
					const bookmarkedGUID = (process.env.SANDBOX)
						? process.env.SANDBOX_BOOKMARKED_NOTEBOOK_GUID
						: process.env.PROD_BOOKMARKED_NOTEBOOK_GUID;
					if (n.notebookGuid === bookmarkedGUID) {
						rejectedNoteCount++;
						return false;
					}

					return true;
				})
				// just the fields we need
				.map(n => ({
					evernoteGUID: n.guid,
					title: n.title,
					source: n.attributes.sourceURL,
					categories: { set: [ n.notebookGuid ] },
					tags: (n.tagGuids) ? { set: [ ...n.tagGuids ] } : null,
				}))
				// create the note in prisma
				.map(async data => {
					const { evernoteGUID } = await ctx.prisma.createNote({ ...data }, config.info);
					return evernoteGUID;
				});

				return Promise.all(createNotes).then(notes => notes);
		})
		.catch(err => console.log(err));

		if (rejectedNoteCount > 0) {
			console.log({ rejectedNoteCount });
			// TODO then increment the offset by that amount call this function again, until we hit 10
		}

		return notes;
};

const getNoteContent = async (ctx, store, config, notes) => {
	console.log('getNoteContent'.cyan);

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

	const resolveNoteContent = notes.map(async (evernoteGUID) => {
		const note = await store.getNoteWithResultSpec(evernoteGUID, spec)
			.then(data => {
				const { content, guid, resources } = data;
				// TODO save image
				// minify image data
				/*
				try {
					const optimizedImage = await imagemin.buffer(resources[0].data.body, {
						plugins: [
							imageminJpegtran(),
							imageminPngquant({ quality: [ 0.7, 0.8 ] })
						]
					}).catch(err => {
						console.log(err);
					});
					console.log('uploading to cloudinary...');
					// save it out from the note
						const res = await fetch(process.env.CLOUDINARY_API_URL, {
							method: 'POST',
							body: optimizedImage,
						});

					console.log({ res });
					// const file = await res.json();
				} catch { }
				*/

				return {
					content,
					evernoteGUID: guid,
					image: 'temp.jpg',
				};
			})
			// create the note in prisma
			.then(async data => {
				console.log({ data, where: { evernoteGUID: data.evernoteGUID } });
				const { evernoteGUID } = await ctx.prisma.updateNote({ data, where: { evernoteGUID: data.evernoteGUID } }, config.info);
				return evernoteGUID;
			})
			.catch(err => console.log(err));
		return evernoteGUID;
	});

	return Promise.all(resolveNoteContent).then(notes => notes);
};

export default {
	Query: {
		// get note from evernote
		note: async (parent, args, ctx) => {
			console.log('note');
			console.log({ ctx });
			const response = {
				__typename: 'EvernoteResponse',
				errors: [],
				notes: [],
			};
			const { req } = ctx;
			const { authToken } = req.session;
			if (authToken) {
				response.errors.push('Not authenticated to evernote!');
				console.log({ response });
				return response;
			}

			// TODO get note from evernote

			console.log({ response });
			return response;
		},
		// get notes from evernote
		notes: async (parent, args, ctx, info) => {
			console.log('notes'.red);
			const { req } = ctx;
			const { authToken, offset } = req.session;
			const response = {
				__typename: 'EvernoteResponse',
				errors: [],
				notes: [],
			};

			if (!authToken) {
				response.errors.push('Not authenticated to evernote!');
				return response;
			}

			const store = getNoteStore(authToken);

			req.session.offset = (offset) ? offset : 0;

			// fetch the number of total notes in evernote
			const filter = new Evernote.NoteStore.NoteFilter();
			console.log("fetching note counts...");
			const counts = await store.findNoteCounts(filter, false)
			const { notebookCounts } = counts;

			let totalCount = 0;
			// remove the bookmarks from the total count
			Object.values(notebookCounts).forEach(v => { totalCount = totalCount + v; })

			const config = {
				info,
				filter,
				offset: req.session.offset,
				totalCount,
			};

			// get notes from evernote
			return await findNotesMeta(ctx, store, config)
				/*
					{
						"guid": "7aa92800-43fe-45c6-8786-5ff0b0cda5f0",
						"title": "Spring Onion and Cabbage Okonomiyaki",
						"notebookGuid": "76e39d26-965a-4118-9e91-8cd1cee795bf",
						"sourceUrl": "http://westernliving.ca/recipes/2014/07/01/spring-onion-cabbage-okonomiyaki/",
						"tagGuids": [
							"b686c342-d33c-4f9b-9e16-366ca31a7494"
						]
					}
				*/
				.then(notes => getNoteContent(ctx, store, config, notes))
				.then((notes) => {

					// update increment
					const offsetIncrement = parseInt(process.env.DOWNLOAD_LIMIT, 10);
					if ((offset + offsetIncrement) <= totalCount) {
						req.session.offset += offsetIncrement;
					} else {
						req.session.offset = 0;
					}

					return notes;
				})
				.catch((err) => {
					response.errors.push(err);
					return response;
				});
		},
	},

	Mutation: {
		parseNotes: async () => {
			console.log('parseNotes');
			// TODO parse notes
			const response = {};
			return response;
		},
	},
};
