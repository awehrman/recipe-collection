import { GET_ALL_INGREDIENT_FIELDS_FOR_VALIDATION, GET_ALL_RECIPE_FIELDS_FOR_VALIDATION, GET_PARSING_ERRORS } from '../graphql/fragments';

export default {
	Query: {
		dashboardIngredients: async (parent, args, ctx) => {
			console.log('dashboardIngredients'.yellow);
			const response = {
				__typename: 'DashboardResponse',
				errors: [],
				newIngredients: [],
			};
			const ingredients = await ctx.prisma.ingredients({ last: 10 }).$fragment(GET_ALL_INGREDIENT_FIELDS_FOR_VALIDATION);
			response.newIngredients = ingredients;
			return response;
		},
		dashboardParsing: async (parent, args, ctx) => {
			console.log('dashboardParsing'.yellow);
			const response = {
				__typename: 'DashboardResponse',
				errors: [],
				parsingErrors: [],
			};
			const parsingErrors = await ctx.prisma.recipeIngredients({
				last: 10,
				where: { isParsed: false },
			}).$fragment(GET_PARSING_ERRORS);
			response.parsingErrors = parsingErrors;
			return response;
		},
		dashboardRecipes: async (parent, args, ctx) => {
			console.log('dashboardRecipes'.yellow);
			const response = {
				__typename: 'DashboardResponse',
				errors: [],
				newRecipes: [],
			};
			const recipes = await ctx.prisma.recipes({ last: 10 }).$fragment(GET_ALL_RECIPE_FIELDS_FOR_VALIDATION);
			response.newRecipes = recipes;
			return response;
		},
	},
};
