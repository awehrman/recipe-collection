import { GET_ALL_INGREDIENT_FIELDS_FOR_VALIDATION, GET_PARSING_ERRORS, GET_RECIPE_CARD_FIELDS } from '../graphql/fragments';

export default {
	Query: {
		dashboardIngredients: async (parent, args, ctx) => {
			console.log('dashboardIngredients'.yellow);
			const response = {
				__typename: 'DashboardResponse',
				errors: [],
				newlyVerified: [],
				newlyParsed: [],
				numIngredients: 0,
				numUnverified: 0,
				numLines: 0,
				numRecipes: 0,
			};

			const ingredients = await ctx.prisma.ingredients({
				last: 20,
				where: { isValidated: true },
			}).$fragment(GET_ALL_INGREDIENT_FIELDS_FOR_VALIDATION)
				.catch((err) => { response.errors.push(err); });
			response.newlyVerified = ingredients;

			const parsed = await ctx.prisma.ingredients({
				last: 20,
				where: { isValidated: false },
			}).$fragment(GET_ALL_INGREDIENT_FIELDS_FOR_VALIDATION)
				.catch((err) => { response.errors.push(err); });
			response.newlyParsed = parsed;

			const linesCount = await ctx.prisma.recipeIngredientsConnection()
				.aggregate()
				.count()
				.catch((err) => { response.errors.push(err); });
			response.numLines = linesCount;

			const newIngredientsCount = await ctx.prisma.ingredientsConnection({ where: { isValidated: false } })
				.aggregate()
				.count()
				.catch((err) => { response.errors.push(err); });
			response.numUnverified = newIngredientsCount;

			const ingredientsCount = await ctx.prisma.ingredientsConnection()
				.aggregate()
				.count()
				.catch((err) => { response.errors.push(err); });
			response.numIngredients = ingredientsCount;

			const recipesCount = await ctx.prisma.recipesConnection()
				.aggregate()
				.count()
				.catch((err) => { response.errors.push(err); });
			response.numRecipes = recipesCount;

			return response;
		},
		dashboardParsing: async (parent, args, ctx) => {
			console.log('dashboardParsing'.yellow);
			const response = {
				__typename: 'DashboardResponse',
				errors: [],
				parsingInstances: [],
				parsingErrors: 0,
				semanticErrors: 0,
				dataErrors: 0,
				instruction: 0,
				equipment: 0,
				baseRate: 0,
				adjustedRate: 0,
				parsingRate: 0,
				dataAccuracy: 0,
			};

			const parsingInstances = await ctx.prisma.recipeIngredients({
				last: 5,
				where: { isParsed: false },
			}).$fragment(GET_PARSING_ERRORS)
				.catch((err) => { response.errors.push(err); });
			response.parsingInstances = parsingInstances;

			const parsingErrors = await ctx.prisma.recipeIngredientsConnection({ where: { isParsed: false } })
				.aggregate()
				.count()
				.catch((err) => { response.errors.push(err); });
			response.parsingErrors = parsingErrors;

			// TODO semanticErrors
			// TODO dataErrors
			// TODO instruction
			// TODO equipment

			// TODO baseRate
			/*
				(errors && errors.hasOwnProperty('total') && lines && (lines > 0))
					? ` ${(100 - (((errors.total) / lines) * 100)).toFixed(2)}%`
					: null
			*/
			// TODO adjustedRate
			/*
				(errors && errors.hasOwnProperty('parsing') && errors.hasOwnProperty('semantic') && lines && (lines > 0))
					? ` ${(100 - (((errors.parsing + errors.semantic) / lines) * 100)).toFixed(2)}%`
					: null
			*/
			// TODO parsingRate
			/*
				(errors && errors.hasOwnProperty('parsing') && lines && (lines > 0))
					? ` ${(100 - (((errors.parsing) / lines) * 100)).toFixed(2)}%`
					: null
			*/
			// TODO dataAccuracy
			/*
				(errors && errors.hasOwnProperty('data') && errors.hasOwnProperty('instruction')
				&& errors.hasOwnProperty('equipment') && lines && (lines > 0))
					? ` ${(100 - (((errors.data + errors.instruction + errors.equipment) / lines) * 100)).toFixed(2)}%`
					: null
			*/

			return response;
		},
		dashboardRecipes: async (parent, args, ctx) => {
			console.log('dashboardRecipes'.yellow);
			const response = {
				__typename: 'DashboardResponse',
				errors: [],
				newRecipes: [],
			};

			const recipes = await ctx.prisma.recipes({ last: 8 })
				.$fragment(GET_RECIPE_CARD_FIELDS)
				.catch((err) => { response.errors.push(err); });
			response.newRecipes = recipes;

			return response;
		},
	},
};
