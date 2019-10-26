// import { GET_ALL_INGREDIENT_FIELDS_FOR_VALIDATION, GET_ALL_INGREDIENT_FIELDS } from '../graphql/fragments';

export default {
	Query: {
		// get note from evernote
		note: async (parent, args, ctx) => {
			console.log('note');
			console.log({ ctx });
			const note = [];
			let { evernoteAuthToken } = args;
			if (!evernoteAuthToken) {
				// TODO authenticate mutation
				// evernoteAuthToken = = await ctx.prisma.evernote().$fragment(GET_ALL_INGREDIENT_FIELDS_FOR_VALIDATION);
			}

			// TODO get note from evernote


			return note;
		},
		// get notes from evernote
		notes: async (parent, args, ctx) => {
			console.log('notes'.red);
			const { req } = ctx;
			const notes = [];

			console.log(req);
			// TODO authenticate mutation;

			// TODO get notes from evernote

			return notes;
		},
	},

	Mutation: {
		parseNotes: async (parent, args, ctx, info) => {
			console.log('parseNotes');
			// TODO parse notes
			const response = {};
			return response;
		},
	},
};
