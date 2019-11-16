import cloudinary from 'cloudinary';
import Evernote from 'evernote';
import imagemin from 'imagemin';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminPngquant from 'imagemin-pngquant';
import pluralize from 'pluralize';

import { parseHTML } from '../util/parser';
/* eslint-disable */
import {
	GET_ALL_RECIPE_FIELDS,
	GET_ALL_NOTE_FIELDS,
	GET_NOTE_CONTENT_FIELDS,
	GET_BASIC_INGREDIENT_FIELDS,
	GET_ID,
	GET_BASIC_RECIPE_INGREDIENT_FIELDS,
	GET_PARSED_FIELDS,
} from '../graphql/fragments';
/* eslint-enable */

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
		// check that these notes aren't already staged
		.then(async ({ notes }) => {
			console.log({ notes });
			const evernoteGUIDS = notes.map((n) => n.guid);

			const existingNotes = await ctx.prisma.notes({ where: { evernoteGUID_in: evernoteGUIDS } })
				.$fragment(GET_ID)
				.catch((err) => { throw err; });

			console.log({ existingNotes });

			if (existingNotes && (existingNotes.length > 0)) {
				const { req } = ctx;
				const initOffset = req.session.offset;
				req.session.offset += existingNotes.length;
				console.log(`offset has been updated to ${ req.session.offset } from ${ initOffset }`);
				const response = await store.findNotesMetadata(filter, req.session.offset, maxResults, spec);
				return response;
			}

			return { notes };
		})
		.then(({ notes }) => {
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

const parseContent = (note) => {
	console.log('parseContent'.magenta);
	const { id } = note;
	const { ingredients, instructions } = parseHTML(note.content);
	return {
		id,
		ingredients,
		instructions,
	};
};

const determinePluralization = (value) => {
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
			plural = pluralize.plural(value);
		} catch (err) {
			//
		}
	}

	plural = (plural === name) ? null : plural;

	return {
		name,
		plural,
	};
};

// TODO cache these values to save lookups
const lookupIngredient = async (ctx, value) => {
	console.log(`looking up ingredient ${ value }....`);
	const { name, plural } = determinePluralization(value);
	const values = [ ...new Set([
		name,
		plural,
		value,
	]) ].filter((v) => v);

	// check if this ingredient exists
	const existing = await ctx.prisma.ingredients({
		where: {
			OR: [
				{ name_in: values },
				{ plural_in: values },
				{ alternateNames_some: { name_in: values } },
			],
		},
	}).$fragment(GET_BASIC_INGREDIENT_FIELDS)
		.catch((err) => { console.log(err); });

	if (existing && (existing.length > 0)) {
		console.log(`finished looking up ${ value }`.cyan);
		return { id: existing[0].id };
	}

	console.log(`finished looking up ${ value }`.cyan);
	return null;
};

const saveParsedSegment = async (ctx, parsed, isCreateIngredient = false) => {
	const segment = { ...parsed };
	if (parsed.type === 'ingredient') {
		// connect to any existing ingredients
		const existing = await lookupIngredient(ctx, parsed.value);

		if (existing) {
			segment.ingredient = { connect: { id: existing.id } };
			console.log('existing!'.green);
			console.log({ connect: { id: existing.id } });
		} else if (!existing && isCreateIngredient) {
			const { name, plural } = determinePluralization(parsed.value);
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
			};
			const id = await ctx.prisma.createIngredient({ ...data }).$fragment(GET_ID)
				.catch((err) => {
					// TODO i feel like we're always ending up down here; very suspicious
					segment.retry = true;
					console.log(`${ name }`.red);
					console.log({ ...data });
					console.log({ err });
				});

			if (id) {
				segment.ingredient = { connect: { id } };
				console.log('!'.blue);
				console.log(segment.ingredient);
			}
		}
	}

	if (!segment.retry) {
		const { id } = await ctx.prisma.createParsedSegment({ ...segment })
			.$fragment(GET_ID)
			.catch((err) => {
				console.log('A');
				throw err;
			});

		return { id };
	}
	console.log(`retrying ${ parsed.value }...`.red);
	const parsedSegment = await saveParsedSegment(ctx, parsed, isCreateIngredient);
	console.log({ parsedSegment });
	return parsedSegment;
};

const parseIngredients = async (ctx, ingredients, isCreateIngredient = false) => {
	const resolveInstructionLines = ingredients.map(async (line) => {
		const ingredientLine = { ...line };
		if (line.isParsed && line.parsed) {
			const resolveParsed = line.parsed.map(async (parsed) => {
				const parsedID = await saveParsedSegment(ctx, parsed, isCreateIngredient);
				return parsedID;
			});

			ingredientLine.parsed = await Promise.all(resolveParsed)
				.then((ids) => ({ connect: ids }))
				.catch((err) => { throw err; });
		}

		// save ingredientLine to prisma
		const { id } = await ctx.prisma.createRecipeIngredient({ ...ingredientLine })
			.$fragment(GET_ID)
			.catch((err) => { throw err; });

		return { id };
	});

	const ids = await Promise.all(resolveInstructionLines)
		.catch((err) => { throw err; });

	return ids;
};

const saveInstructions = async (ctx, instructions) => {
	console.log('saveInstructions'.blue);
	const resolveInstructions = instructions.map(
		async (line) => ctx.prisma
			.createRecipeInstruction({ ...line })
			.$fragment(GET_ID)
			.catch((err) => { throw err; }),
	);
	const ids = await Promise.all(resolveInstructions)
		.catch((err) => { throw err; });
	return ids;
};

const saveNotes = async (ctx, notes) => {
	console.log('saveNotes'.magenta);

	const resolveUpdates = notes.map(async (note) => {
		const data = {
			ingredients: { connect: note.ingredients },
			instructions: { connect: note.instructions },
		};
		const where = { id: note.id };
		const noteRes = await ctx.prisma.updateNote({
			data,
			where,
		}).$fragment(GET_NOTE_CONTENT_FIELDS)
			.catch((err) => { throw err; });

		return noteRes;
	});

	const updated = await Promise.all(resolveUpdates)
		.catch((err) => { throw err; });

	return updated;
};

const processNotes = async (ctx, notes) => {
	console.log('processNotes'.cyan);

	// parse the dom content into ingredients and instructions objects
	const parsedNotes = notes.map((note) => parseContent(note));

	// then go through each note and save out their ingredient and instruction lines
	const resolveLines = parsedNotes.map(async (note) => {
		const { id } = note;
		const resolveIngredients = parseIngredients(ctx, note.ingredients);
		const resolveInstructions = saveInstructions(ctx, note.instructions);

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

const createRecipe = async (ctx, note) => {
	console.log('createRecipe'.green);
	const data = {
		evernoteGUID: note.evernoteGUID || null,
		title: note.title,
		source: note.source,
		// TODO categories
		// TODO tags
		image: note.image,
	};

	// TODO need to re-save ingredients and instructions
	const resolveIngredients = parseIngredients(ctx, note.ingredients, true);
	const resolveInstructions = saveInstructions(ctx, note.instructions);

	const { ingredients, instructions } = await Promise.all([ resolveIngredients, resolveInstructions ])
		.then((ids) => ({
			ingredients: ids[0],
			instructions: ids[1],
		}))
		.catch((err) => { throw err; });

	data.ingredients = { connect: ingredients };
	data.instructions = { connect: instructions };

	const recipe = await ctx.prisma.createRecipe({ ...data }).$fragment(GET_ALL_RECIPE_FIELDS);
	return recipe;
};

const removeNote = async (ctx, note) => {
	console.log('removing note!'.red);
	return ctx.prisma.deleteNote({ id: note.id });
};

const createRecipes = async (ctx, notes) => {
	console.log('createRecipes'.cyan);

	// then go through each note and save out their ingredient and instruction lines
	const resolveRecipes = notes.map(async (note) => {
		// create the recipe
		const recipe = await createRecipe(ctx, note);
		// then remove the note
		await removeNote(ctx, note);

		return recipe;
	});

	const notesRes = await Promise.all(resolveRecipes)
		.catch((err) => { throw err; });
	return notesRes;
};

const updateRecipeReference = async (ctx, recipe) => {
	const { id } = recipe;
	const resolveIngredients = recipe.ingredients.map(async (line) => {
		if (!line.isParsed || !line.parsed) {
			return line;
		}

		// then we need to pick out the ingredients from the parsed segment
		// and update those with our references
		const ingredients = line.parsed.filter((p) => p.ingredient);
		const resolveIngredientReferences = ingredients.map(async (ing) => {
			const updated = await ctx.prisma.updateIngredient({
				data: {
					references: {
						create: {
							recipeID: { connect: { id } },
							reference: { connect: { id: line.id } },
						},
					},
				},
				where: { id: ing.id },
			}).$fragment(GET_ID)
				.catch((err) => { throw err; });

			return updated;
		});

		return Promise.all(resolveIngredientReferences)
			.catch((err) => { throw err; });
	});

	return Promise.all(resolveIngredients)
		.catch((err) => { throw err; });
};

const updateIngredientReferences = async (ctx, recipes) => {
	console.log('updateIngredientReferences'.yellow);

	const resolveReferences = recipes.map(async (recipe) => updateRecipeReference(ctx, recipe));

	await Promise.all(resolveReferences)
		.catch((err) => { throw err; });

	return recipes;
};

export default {
	Query: {
		noteAggregate: async (parent, args, ctx) => {
			const count = await ctx.prisma.notesConnection().aggregate().count();
			console.log({
				count,
				importDefault: process.env.DOWNLOAD_LIMIT,
			});
			return {
				count,
				importDefault: process.env.DOWNLOAD_LIMIT,
			};
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
					console.log({ response });
					return response;
				})
				.catch((err) => {
					response.errors.push(err);
					return response;
				});
		},
		parseNotes: async (parent, args, ctx) => {
			console.log('parseNotes'.cyan);
			const response = {
				__typename: 'EvernoteResponse',
				errors: [],
				notes: [],
			};

			// fetch our note content from the db
			response.notes = await ctx.prisma.notes().$fragment(GET_NOTE_CONTENT_FIELDS)
				// go thru each notes
				.then(async (notes) => processNotes(ctx, notes, false))
				// save new note connections to the database
				.then(async (notes) => saveNotes(ctx, notes))
				.catch((err) => {
					console.log('An error occurred!'.red);
					console.log({ err });
					response.errors.push(err);
				});

			console.log('DONE'.green);
			console.log({ response });
			return response;
		},
		// TODO this needs to go back through and update ingredients with their references
		convertNotes: async (parent, args, ctx) => {
			console.log('convertNotes'.cyan);
			// get all imported notes
			const response = {
				__typename: 'RecipesResponse',
				errors: [],
				recipes: [],
			};

			// fetch our note content from the db
			response.recipes = await ctx.prisma.notes().$fragment(GET_ALL_NOTE_FIELDS)
				// go thru each note and create a recipe and remove the associated note
				.then(async (notes) => createRecipes(ctx, notes, false))
				// then we need to update each ingredient instance with the recipeID and reference line
				.then(async (recipes) => updateIngredientReferences(ctx, recipes))
				.catch((err) => {
					console.log('An error occurred!'.red);
					response.errors.push(err);
				});

			console.log('DONE'.green);
			console.log({ response });
			return response;
		},
	},
};
