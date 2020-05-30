import { GET_ALL_NOTE_FIELDS, GET_NOTE_CONTENT_FIELDS } from '../graphql/fragments';
import { processIngredients } from '../util/ingredients';
import { downloadNotes, processNotes, sortParsedSegments, updateNotes } from '../util/notes';
import { createRecipes, updateIngredientReferences } from '../util/recipes';
import { parseNotesContent } from '../util/parser';

export default {
	Query: {
		noteAggregate: async (parent, args, ctx) => {
			const count = await ctx.prisma.notesConnection().aggregate().count();
			return {
				count,
				importDefault: process.env.DOWNLOAD_LIMIT,
			};
		},
		note: async (parent, args, ctx) => {
			const { where } = args || {};
			const { id } = where || {};
			const unsorted = await ctx.prisma.note({ id }).$fragment(GET_ALL_NOTE_FIELDS);
			const note = sortParsedSegments([ unsorted ]);
			return note[0];
		},
		notes: async (parent, args, ctx) => {
			const unsorted = await ctx.prisma.notes().$fragment(GET_ALL_NOTE_FIELDS);
			// TODO research this some more; since i'm using the demo server i don't have control on autoincrements
			// we might need to enforce sorting in certain parts like here

			// ensure that we keep the parsed sections sorted by
			const notes = sortParsedSegments(unsorted);

			return notes;
		},
	},
	Mutation: {
		importNotes: async (parent, args, ctx) => {
			console.log('importNotes'.cyan);
			const { req } = ctx;
			const { authToken } = req.session;
			const response = {
				__typename: 'EvernoteResponse',
				errors: [],
				notes: [],
			};

			if (!authToken) {
				response.errors.push('Not authenticated to evernote!');
				return response;
			}

			// download and tag new notes from evernote
			const notes = await downloadNotes(ctx)
				.catch((err) => {
					console.log({ err });
					response.errors.push({ err });
				});
			response.notes = notes;

			console.log({ response });
			return response;
		},
		parseNotes: async (parent, args, ctx) => {
			console.log('parseNotes'.cyan);
			const response = {
				__typename: 'EvernoteResponse',
				errors: [],
				notes: [],
			};

			// fetch our note content from the db
			const notesRes = await ctx.prisma.notes().$fragment(GET_NOTE_CONTENT_FIELDS)
				// copy over any existing parsed lines for cleanup later
				.then((notes) => notes.map((n) => ({
					...n,
					priorIngredients: n.ingredients.map((i) => ({ id: i.id })),
					priorInstructions: n.instructions.map((i) => ({ id: i.id })),
				})))
				// parse note content into ingredients and instructions
				.then((notes) => {
					const parsedNotes = parseNotesContent(notes);
					return parsedNotes;
				})
				// go thru each notes
				.then(async (notes) => processNotes(ctx, [], notes, false))
				// save new note connections to the database
				.then(async (notes) => updateNotes(ctx, notes))
				.catch((err) => {
					console.log('An error occurred!'.red);
					console.log({ err });
					response.errors.push(err);
				});

			response.notes = notesRes;
			return response;
		},
		convertNotes: async (parent, args, ctx) => {
			console.log('convertNotes'.cyan);
			// get all imported notes
			const response = {
				__typename: 'RecipesResponse',
				errors: [],
				recipes: [],
			};

			// fetch our note content from the db
			const recipes = await ctx.prisma.notes().$fragment(GET_ALL_NOTE_FIELDS)
				// copy over any existing parsed lines for cleanup later
				.then((notes) => notes.map((n) => ({
					...n,
					priorIngredients: n.ingredients.map((i) => ({ id: i.id })),
					priorInstructions: n.instructions.map((i) => ({ id: i.id })),
				})))
				// create all ingredients within this batch before we start the recipes
				.then(async (notes) => processIngredients(ctx, notes, true))
				// go thru each notes
				.then(async ({ ingredients, notes }) => processNotes(ctx, ingredients, notes, true))
				// go thru each note and create a recipe and remove the associated note
				.then(async (notes) => createRecipes(ctx, notes, false))
				// then we need to update each ingredient instance with the recipe and line references
				.then(async (rp) => updateIngredientReferences(ctx, rp))
				.catch((err) => {
					console.log('An error occurred!'.red);
					console.log({ err });
					response.errors.push(err);
				});

			response.recipes = recipes;
			console.log('DONE'.green);
			return response;
		},
	},
};
