import cloudinary from 'cloudinary';
import Evernote from 'evernote';
import imagemin from 'imagemin';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminPngquant from 'imagemin-pngquant';
import pluralize from 'pluralize';

import { parseHTML } from '../lib/parser';
import { GET_ALL_RECIPE_FIELDS, GET_ALL_NOTE_FIELDS, GET_NOTE_CONTENT_FIELDS, GET_BASIC_INGREDIENT_FIELDS } from '../graphql/fragments';

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

// TODO move these into their own files
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
	console.log({ offset });

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
					const { id, evernoteGUID } = await ctx.prisma.createNote({ ...data }, config.info);
					return {
						id,
						evernoteGUID,
						title: data.title,
					};
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

	const resolveNoteContent = notes.map(async (note) => {
		await store.getNoteWithResultSpec(note.evernoteGUID, spec)
			// minify and upload image
			.then(async (data) => {
				const { content, resources } = data;
				const optimizedImage = await imagemin.buffer(resources[0].data.body, {
					plugins: [
						imageminJpegtran(),
						imageminPngquant({ quality: [ 0.7, 0.8 ] }),
					],
				}).catch((err) => console.log(err));

				const options = { folder: 'recipes' };
				const result = await uploadStream(optimizedImage, options);

				return {
					evernoteGUID: note.evernoteGUID,
					content,
					image: result.secure_url,
				};
			})
			// create the note in prisma
			.then((data) => ctx.prisma.updateNote({
				data,
				where: { evernoteGUID: data.evernoteGUID },
			}, config.info))
			.catch((err) => console.log(err));

		return {
			__typename: 'Note',
			id: note.id,
			title: note.title,
		};
	});

	return Promise.all(resolveNoteContent).then((n) => n);
};

const lookupIngredient = async (ctx, info, value, isCreateIngredient = false, recipeID = null, reference = null) => {
	console.log(`looking up ingredient ${ value }; ${ isCreateIngredient }`);
	// determine pluralization
	let name = pluralize.isSingular(value) ? value : null;
	let plural = pluralize.isPlural(value) ? value : null;

	if (!name) {
		// attempt to pluralize the ingredient name
		try {
			name = pluralize.singular(value);
		} catch (err) {
			name = value; // just use n otherwise;
		}
	}

	if (!plural) {
		// attempt to pluralize the ingredient name
		try {
			plural = (pluralize.plural(value) !== name) ? pluralize.plural(value) : null;
		} catch (err) {
			//
		}
	}

	const values = [ ...new Set([
		name,
		plural,
		value,
	]) ];

	const where = {
		OR: [
			{ name_in: values },
			{ plural_in: values },
			{ alternateNames_some: { name_in: values } },
		],
	};

	const existing = await ctx.prisma.ingredients({ where })
		.$fragment(GET_BASIC_INGREDIENT_FIELDS)
		.catch((err) => { console.log(err); });
	let connect;
	// if we're ready to create this ingredient and it doesn't exist
	if (isCreateIngredient && (!existing || (existing.length === 0))) {
		console.log(`creating ingredient "${ name }"`.red);
		const data = {
			name,
			plural,
			properties: {
				create: {
					meat: false,
					poultry: false,
					fish: false,
					dairy: false,
					soy: false,
					gluten: false,
				},
			},
			references: {
				create: [
					{
						recipeID,
						reference,
					},
				],
			},
		};

		// instead we'll create the ingredient here
		const { id } = await ctx.prisma.createIngredient({ ...data }, info);
		connect = { id };
	}

	if (!isCreateIngredient && existing && (existing.length > 0)) {
		connect = {
			id: existing[0].id,
			name: existing[0].name,
			plural: existing[0].plural || plural,
		};

		return { connect };
	}

	return null;
};

const parseNote = async (ctx, info, note, isCreateIngredient = false, recipeID = null) => {
	console.log(`parseNote; ${ isCreateIngredient }`.yellow);

	// parse content into ingredient lines and instruction lines
	const { ingredients, instructions } = parseHTML(note.content);
	const parseIngredientLines = ingredients.map(async (line) => {
		const createInput = {
			blockIndex: line.blockIndex,
			lineIndex: line.lineIndex,
			reference: line.reference,
			rule: line.rule,
			isParsed: line.isParsed,
		};

		// return the line as is if it isn't parsed
		if (!createInput.isParsed) {
			return createInput;
		}

		// otherwise we'll need to create new input
		const createParsed = line.parsed.map(async (parsed) => {
			if (parsed.type === 'ingredient') {
				const ingredient = await lookupIngredient(ctx, info, parsed.value, isCreateIngredient, recipeID, line.reference)
					.catch((err) => { throw err; });

				if (ingredient) {
					return {
						...parsed,
						ingredient,
					};
				}
			}

			return { ...parsed };
		});

		createInput.parsed = {
			create: await Promise.all(createParsed)
				.catch((err) => { throw err; }),
		};

		return createInput;
	});

	const ingredientLines = await Promise.all(parseIngredientLines)
		.catch((err) => { throw err; });

	return {
		ingredients: { create: ingredientLines },
		instructions: { create: instructions },
	};
};

export default {
	Query: {
		noteAggregate: async (parent, args, ctx) => {
			const count = await ctx.prisma.notesConnection().aggregate().count();
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

			// fetch the number of total notes in evernote
			const filter = new Evernote.NoteStore.NoteFilter();
			const counts = await store.findNoteCounts(filter, false);
			const { notebookCounts } = counts;

			let totalCount = 0;
			Object.values(notebookCounts).forEach((v) => { totalCount += v; });

			req.session.offset = (!offset || (offset > totalCount)) ? 0 : offset;

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

					response.notes = notes;
					return response;
				})
				.catch((err) => {
					response.errors.push(err);
					return response;
				});
		},
		parseNotes: async (parent, args, ctx, info) => {
			console.log('parseNotes'.cyan);
			const response = {
				__typename: 'EvernoteResponse',
				errors: [],
				notes: [],
			};

			console.log('fetching notes...');
			await ctx.prisma.notes().$fragment(GET_NOTE_CONTENT_FIELDS)
				.then(async (notes) => {
					console.log(`${ notes.length } notes found!`);
					const parseNotes = notes.map(async (note) => {
						// parse note into ingredients and instructions
						const data = await parseNote(ctx, info, { content: note.content });

						// save these parsed updates to prisma
						const where = { id: note.id };

						let noteRes = await ctx.prisma.updateNote({
							data: {
								ingredients: { deleteMany: { id_not: null } },
								instructions: { deleteMany: { id_not: null } },
							},
							where,
						}, info).$fragment(GET_NOTE_CONTENT_FIELDS);

						// update prisma with new note info
						noteRes = await ctx.prisma.updateNote({
							data,
							where,
						}, info).$fragment(GET_NOTE_CONTENT_FIELDS);

						// return the clean notes response
						return noteRes;
					});

					await Promise.all(parseNotes)
						.then((notesRes) => {
							response.notes = notesRes;
						})
						.catch((err) => { throw err; });
				})
				.catch((err) => {
					response.errors.push(err);
				});

			console.log('returning response!'.red);
			console.log(`${ JSON.stringify(response, null, 2) }`.green);

			return response;
		},
		convertNotes: async (parent, args, ctx, info) => {
			console.log('convertNotes'.cyan);
			// get all imported notes
			const response = {
				__typename: 'RecipesResponse',
				errors: [],
				recipes: [],
			};

			console.log('fetching notes...');
			await ctx.prisma.notes().$fragment(GET_ALL_NOTE_FIELDS)
				.then(async (notes) => {
					console.log(`${ notes.length } notes found!`);
					const parseNotes = notes.map(async (note) => {
						const data = {};
						// create ingredients and instructions
						data.image = note.image;
						data.source = note.source;
						data.title = note.title;
						data.evernoteGUID = note.evernoteGUID;
						data.tags = []; // TODO tags
						data.categories = []; // TODO categories

						// update prisma with new note info
						const recipeRes = await ctx.prisma.createRecipe({ ...data }, info).$fragment(GET_ALL_RECIPE_FIELDS);
						console.log(`created recipe ${ recipeRes.id }!`.magenta);
						// then go back and add in our ingredients/instructions now that we have our recipeID
						const parsedLines = await parseNote(ctx, info, { content: note.content }, true, recipeRes.id);

						// update the recipe with our parsed content lines
						const updated = await ctx.prisma.updateRecipe({
							data: { ...parsedLines },
							where: { id: recipeRes.id },
						}, info).$fragment(GET_ALL_RECIPE_FIELDS);
						console.log(`updated recipe ${ recipeRes.id }!`.magenta);
						// return the clean notes response
						return updated;
					});

					await Promise.all(parseNotes)
						.then((recipeRes) => {
							response.recipes = recipeRes;
						})
						.catch((err) => { throw err; });
				})
				.catch((err) => {
					response.errors.push(err);
				});

			console.log('returning response!'.red);
			console.log(`${ JSON.stringify(response, null, 2) }`.green);


			return response;
		},
	},
};
