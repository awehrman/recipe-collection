import { GET_ALL_NOTE_FIELDS } from '../graphql/fragments';
import { downloadNotes } from '../util/notes';

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
			const note = await ctx.prisma.note({ id }).$fragment(GET_ALL_NOTE_FIELDS);
			return note;
		},
		notes: async (parent, args, ctx) => {
			const notes = await ctx.prisma.notes().$fragment(GET_ALL_NOTE_FIELDS);
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

			console.log({ response: response.notes });
			return response;
		},
		/*
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
		*/
	},
};
