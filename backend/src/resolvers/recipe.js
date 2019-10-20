import { GET_ALL_RECIPE_FIELDS_FOR_VALIDATION, GET_ALL_RECIPE_FIELDS } from '../graphql/fragments';

export default {
	Query: {
		recipe: async (parent, args, ctx) => {
			const { where } = args || {};
			const { id } = where || {};
			return ctx.prisma.recipe({ id }).$fragment(GET_ALL_RECIPE_FIELDS);
		},
		recipes: async (parent, args, ctx) => {
			const recipes = await ctx.prisma.recipes().$fragment(GET_ALL_RECIPE_FIELDS);
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
			console.log({ data });

			try {
				const { id } = await ctx.prisma.createRecipe({ ...data }, info);
				const recipe = await ctx.prisma.recipe({ id }).$fragment(GET_ALL_RECIPE_FIELDS_FOR_VALIDATION);
				response.recipe = {
					__typename: 'Recipe',
					...recipe,
				};
			} catch (err) {
				console.log(err);
				const { result } = err;
				const { errors } = result;
				errors.forEach((error) => {
					const { message } = error;
					response.errors.push(message);
				});
			}
			console.log(JSON.stringify(response, null, 2));
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
			console.log(JSON.stringify(response, null, 2));
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
			console.log(JSON.stringify(response, null, 2));
			return response;
		},
	},
};
