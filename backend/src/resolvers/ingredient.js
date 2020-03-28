import { GET_ALL_INGREDIENT_FIELDS_FOR_VALIDATION, GET_ALL_INGREDIENT_FIELDS } from '../graphql/fragments';

export default {
	Query: {
		ingredientAggregate: async (parent, args, ctx) => {
			const count = await ctx.prisma.ingredientsConnection().aggregate().count();
			const unverified = await ctx.prisma.ingredientsConnection({ where: { isValidated: false } }).aggregate().count();

			return {
				count,
				unverified,
			};
		},
		ingredient: async (parent, args, ctx) => {
			const { where } = args || {};
			const { id } = where || {};
			console.log('ingredient', { id });
			const ingredient = await ctx.prisma.ingredient({ id }).$fragment(GET_ALL_INGREDIENT_FIELDS);
			return ingredient;
		},
		ingredients: async (parent, args, ctx) => {
			const ingredients = await ctx.prisma.ingredients().$fragment(GET_ALL_INGREDIENT_FIELDS_FOR_VALIDATION);
			return ingredients;
		},
	},

	Mutation: {
		createIngredient: async (parent, args, ctx, info) => {
			console.log('createIngredient');
			const response = {
				__typename: 'IngredientResponse',
				ingredient: null,
				errors: [],
			};

			const { data } = args;
			// TODO add in joi validation

			try {
				const { id } = await ctx.prisma.createIngredient({ ...data }, info);
				const ingredient = await ctx.prisma.ingredient({ id }).$fragment(GET_ALL_INGREDIENT_FIELDS_FOR_VALIDATION);
				response.ingredient = {
					__typename: 'Ingredient',
					...ingredient,
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
		deleteIngredient: async (parent, args, ctx, info) => {
			console.log('deleteIngredient');
			const response = {
				__typename: 'IngredientResponse',
				ingredient: null,
				errors: [],
			};

			const { where } = args;
			// TODO add in joi validation

			try {
				await ctx.prisma.deleteIngredient({ where }, info);
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
		updateIngredient: async (parent, args, ctx, info) => {
			console.log('updateIngredient');
			const response = {
				__typename: 'IngredientResponse',
				ingredient: null,
				errors: [],
			};

			const { data, where } = args;
			// TODO add in joi validation

			try {
				const { id } = await ctx.prisma.updateIngredient({
					data,
					where,
				}, info);
				const ingredient = await ctx.prisma.ingredient({ id }).$fragment(GET_ALL_INGREDIENT_FIELDS);
				response.ingredient = {
					__typename: 'Ingredient',
					...ingredient,
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
