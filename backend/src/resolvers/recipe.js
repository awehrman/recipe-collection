export default {
	Query: {
		recipe: (parent, args, ctx) => ctx.prisma.recipe({ id: args.id }),
		recipes: (parent, args, ctx) => ctx.prisma.recipes(),
		recipeAggregate: async (parent, args, ctx) => {
			console.log('recipeAggregate');
			const recipesCount = await ctx.prisma.recipesConnection().aggregate().count();
			return { recipesCount };
		},
	},

	Mutation: {
		createRecipe: async (parent, args, ctx, info) => {
			console.log('createRecipe');
			const {
				evernoteGUID,
				image,
				source,
				title,
				categories,
				tags,
			} = args;

			// TODO reject if no title is provided

			let recipe = {
				title,
				evernoteGUID,
				image,
				source,	// TODO break up url vs book links eventually
			};

			if (categories && categories.length > 0) {
				// TODO if no id is provided, create the category
				recipe.categories = { connect: categories.map(i => ({ id: i })) };
			}

			if (tags && tags.length > 0) {
				// TODO if no id is provided, create the tag
				recipe.tags = { connect: tags.map(i => ({ id: i })) };
			}

			try {
				recipe = await ctx.prisma.createRecipe({ ...recipe }, info);
				return recipe;
			} catch (err) {
				console.log(err);
			}

			return null;
		},

		deleteRecipe: async () => {
			console.log('TODO deleteRecipe');
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
