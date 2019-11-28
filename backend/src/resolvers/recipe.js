import { GET_ALL_INGREDIENT_FIELDS, GET_ALL_RECIPE_FIELDS } from '../graphql/fragments';

export default {
	Query: {
		recipe: async (parent, args, ctx) => {
			const { where } = args || {};
			const { id } = where || {};
			return ctx.prisma.recipe({ id }).$fragment(GET_ALL_RECIPE_FIELDS);
		},
		recipes: async (parent, args, ctx) => {
			console.log('recipes'.magenta);
			const { limit = 10, offset = 0 } = args;
			// eslint-disable-next-line
			console.log({ limit, offset });
			const recipes = await ctx.prisma.recipes({
				first: limit,
				skip: offset,
			}).$fragment(GET_ALL_RECIPE_FIELDS);
			return recipes;
		},
		recipeAggregate: async (parent, args, ctx) => {
			const recipesCount = await ctx.prisma.recipesConnection().aggregate().count();
			return { recipesCount };
		},
	},

	Mutation: {
		createRecipe: async (parent, args, ctx, info) => {
			console.log('createRecipe'.magenta);
			const response = {
				__typename: 'RecipeResponse',
				recipe: null,
				errors: [],
			};

			const { data } = args;
			// TODO add in joi validation

			try {
				const { id } = await ctx.prisma.createRecipe({ ...data }, info);
				const recipe = await ctx.prisma.recipe({ id }).$fragment(GET_ALL_RECIPE_FIELDS);
				response.recipe = {
					__typename: 'Recipe',
					...recipe,
				};

				// update ingredients with this recipe reference
				const ingredients = recipe.ingredients
					.map((line) => line.parsed.filter((p) => p.type === 'ingredient')
						.map((i) => ({
							...i.ingredient,
							lineID: line.id,
						})))
					.flat();
				const updateIngredients = ingredients.map(async (i) => {
					// references: RecipeIngredientUpdateManyInput
					// TODO i think this is wrong now
					const ingData = { references: { create: [ { id: i.lineID } ] } }; // this is the recipeInstruction index
					const where = { id: i.id };

					// update ingredients with recipe info
					try {
						const ing = await ctx.prisma.updateIngredient({
							data: ingData,
							where,
						}, info);
						await ctx.prisma.ingredient({ id: ing.id }).$fragment(GET_ALL_INGREDIENT_FIELDS);
					} catch (err) {
						console.log(err);
						const { result } = err;
						const { errors } = result;
						errors.forEach((error) => {
							const { message } = error;
							response.errors.push(message);
						});
					}
				});
				await Promise.all(updateIngredients);
			} catch (err) {
				console.log(err);
				const { result } = err;
				const { errors } = result;
				errors.forEach((error) => {
					const { message } = error;
					response.errors.push(message);
				});
			}
			return response;
		},

		deleteRecipe: async (parent, args, ctx, info) => {
			console.log('TODO deleteRecipe');
			const response = {
				__typename: 'RecipeResponse',
				recipe: null,
				errors: [],
			};

			const { where } = args;
			// TODO add in joi validation

			try {
				await ctx.prisma.deleteRecipe({ where }, info);
			} catch (err) {
				// TODO display these on the front-end
				console.log(err);
				const { result } = err;
				const { errors } = result;
				errors.forEach((error) => {
					const { message } = error;
					response.errors.push(message);
				});
			}
			return response;
		},

		updateRecipe: async (parent, args, ctx, info) => {
			console.log('updateRecipe');
			const response = {
				__typename: 'RecipeResponse',
				recipe: null,
				errors: [],
			};

			const { data, where } = args;
			// TODO add in joi validation

			try {
				const { id } = await ctx.prisma.updateRecipe({
					data,
					where,
				}, info);
				const recipe = await ctx.prisma.recipe({ id }).$fragment(GET_ALL_RECIPE_FIELDS);
				response.recipe = {
					__typename: 'Recipe',
					...recipe,
				};
			} catch (err) {
				// TODO display these on the front-end
				console.log(err);
				const { result } = err;
				const { errors } = result;
				errors.forEach((error) => {
					const { message } = error;
					response.errors.push(message);
				});
			}
			return response;
		},
	},
};
