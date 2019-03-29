export default {
	Query: {
		recipe: (parent, args, ctx) => ctx.prisma.recipe({ id: args.id }),
		recipes: (parent, args, ctx) => ctx.prisma.recipes(),
	},

	Mutation: {
		createRecipe: async () => {
			console.log('createRecipe');
			// TODO
		},

		deleteRecipe: async () => {
			console.log('deleteRecipe');
			// TODO
		},

		updateRecipe: async (parent, args, ctx, info) => {
			console.log('updateRecipe');
			console.log('updateRecipe'.blue);
			const updates = { ...args };
			let recipe = {};
			delete updates.id;

			// handle category updates
			const categories = {
				...(updates.categoryConnections && { connect: updates.categoryConnections.map(u => ({ id: u })) }),
				...(updates.categoryDisconnections && { disconnect: updates.categoryDisconnections.map(u => ({ id: u })) }),
			};

			if (updates.categoryConnections) delete updates.categoryConnections;
			if (updates.categoryDisconnections) delete updates.categoryDisconnections;

			// handle tag updates
			const tags = {
				...(updates.tagConnections && { connect: updates.tagConnections.map(u => ({ id: u })) }),
				...(updates.tagDisconnections && { disconnect: updates.tagDisconnections.map(u => ({ id: u })) }),
			};

			if (updates.tagConnections) delete updates.tagConnections;
			if (updates.tagDisconnections) delete updates.tagDisconnections;

			// update the remainder of the fields
			// TODO retest that we've switched to prisma client over bindings
			recipe = await ctx.prisma.updateRecipe(
				{
					data: {
						categories,		// connect and/or disconnect category changes
						tags,					// connect and/or disconnect tag changes
						...updates,		// update any other changed recipe fields (title, evernoteGUID, source, image, etc.)
					},
					where: { id: args.id },
				},
				info,
			);

			return recipe;
		},
	},
};
