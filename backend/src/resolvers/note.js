import cloudinary from 'cloudinary';
import Evernote from 'evernote';
import imagemin from 'imagemin';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminPngquant from 'imagemin-pngquant';

import { GET_ALL_NOTE_FIELDS } from '../graphql/fragments';

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// move this into a util file
const getNoteStore = (token) => {
	const client = new Evernote.Client({
		token,
		sandbox: process.env.SANDBOX,
		china: process.env.CHINA,
	});

	const store = client.getNoteStore();
	return store;
};

const findNotesMeta = async (ctx, store, config) => {
	const { filter, offset } = config;

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
		includeLargestResourceSize: false,
	});

	let rejectedNoteCount = 0;
	console.log('fetching metadata...');
	const notesMeta = await store.findNotesMetadata(filter, offset, maxResults, spec)
		.then((result) => {
			const { notes } = result;
			const createNotes = notes
				// only grab valid notes
				.filter((n) => {
					// reject note if we've already imported it
					const importedGUID = (process.env.SANDBOX)
						? process.env.SANDBOX_BOOKMARKED_NOTEBOOK_GUID
						: process.env.PROD_BOOKMARKED_NOTEBOOK_GUID;
					if (n.tagGuids && n.tagGuids.includes(importedGUID)) {
						rejectedNoteCount += 1;
						return false;
					}

					// reject note if its flagged as a bookmark
					const bookmarkedGUID = (process.env.SANDBOX)
						? process.env.SANDBOX_BOOKMARKED_NOTEBOOK_GUID
						: process.env.PROD_BOOKMARKED_NOTEBOOK_GUID;
					if (n.notebookGuid === bookmarkedGUID) {
						rejectedNoteCount += 1;
						return false;
					}

					return true;
				})
				// just the fields we need
				.map((n) => ({
					evernoteGUID: n.guid,
					title: n.title,
					source: n.attributes.sourceURL,
					categories: { set: [ n.notebookGuid ] },
					tags: (n.tagGuids) ? { set: [ ...n.tagGuids ] } : null,
				}))
				// create the note in prisma
				.map(async (data) => {
					const { evernoteGUID } = await ctx.prisma.createNote({ ...data }, config.info);
					return evernoteGUID;
				});

			return Promise.all(createNotes).then((n) => n);
		})
		.catch((err) => console.log(err));

	if (rejectedNoteCount > 0) {
		console.log({ rejectedNoteCount });
		// TODO then increment the offset by that amount call this function again, until we hit 10
	}

	return notesMeta;
};

const uploadStream = (fileBuffer, options) => (
	new Promise((resolve, reject) => {
		cloudinary.v2.uploader.upload_stream(options, (error, result) => {
			if (error) {
				reject(error);
			} else {
				resolve(result);
			}
		}).end(fileBuffer);
	})
);

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

	const resolveNoteContent = notes.map(async (noteGUID) => {
		await store.getNoteWithResultSpec(noteGUID, spec)
			.then(async (data) => {
				const { content, guid, resources } = data;
				// minify image data
				const optimizedImage = await imagemin.buffer(resources[0].data.body, {
					plugins: [
						imageminJpegtran(),
						imageminPngquant({ quality: [ 0.7, 0.8 ] }),
					],
				}).catch((err) => console.log(err));

				console.log('uploading to cloudinary...');
				const options = { folder: 'recipes' };
				const result = await uploadStream(optimizedImage, options);

				return {
					content,
					evernoteGUID: guid,
					image: result.secure_url,
				};
			})
			// create the note in prisma
			.then(async (data) => {
				const { evernoteGUID } = await ctx.prisma.updateNote({
					data,
					where: { evernoteGUID: data.evernoteGUID },
				}, config.info);
				console.log(`updated ${ evernoteGUID }!`);
				return evernoteGUID;
			})
			.catch((err) => console.log(err));

		return noteGUID;
	});

	return Promise.all(resolveNoteContent).then((n) => n);
};

export default {
	Query: {
		noteAggregate: async (parent, args, ctx) => {
			const count = await ctx.prisma.notesConnection().aggregate().count();
			console.log({ count });
			return { count };
		},
		note: async (parent, args, ctx) => {
			const { where } = args || {};
			const { id } = where || {};
			const note = await ctx.prisma.note({ id }).$fragment(GET_ALL_NOTE_FIELDS);
			return note;
		},
		notes: async (parent, args, ctx) => {
			const notes = await ctx.prisma.notes().$fragment(GET_ALL_NOTE_FIELDS);
			return notes;
		},
	},

	Mutation: {
		importNotes: async (parent, args, ctx, info) => {
			console.log('importNotes'.cyan);
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

			req.session.offset = offset || 0;

			// fetch the number of total notes in evernote
			const filter = new Evernote.NoteStore.NoteFilter();
			const counts = await store.findNoteCounts(filter, false);
			const { notebookCounts } = counts;

			let totalCount = 0;
			// remove the bookmarks from the total count
			Object.values(notebookCounts).forEach((v) => { totalCount += v; });

			const config = {
				info,
				filter,
				offset: req.session.offset,
				totalCount,
			};

			// get notes from evernote
			return findNotesMeta(ctx, store, config)
				.then((notes) => getNoteContent(ctx, store, config, notes))
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
		parseNotes: async (/* parent, args, ctx, info */) => {
			console.log('parseNotes');
			// TODO parse notes
			const response = {};
			return response;
		},
	},
};
