const GET_ALL_INGREDIENT_FIELDS = `
	{
		alternateNames {
			name
		}
		id
		isValidated
		isComposedIngredient
		name
		parent {
			id
		}
		plural
		properties {
			meat
		  poultry
		  fish
		  dairy
		  soy
		  gluten
		}
		relatedIngredients {
			id
			name
		}
		substitutes {
			id
			name
		}
	}
`;

const GET_ALL_INGREDIENT_FIELDS_FOR_VALIDATION = `
	{
		alternateNames {
			name
		}
		isComposedIngredient
		isValidated
		id
		name
		parent {
			id
		}
		plural
		properties {
			meat
		  poultry
		  fish
		  dairy
		  soy
		  gluten
		}
	}
`;

export default {
	Query: {
		ingredientAggregate: async (parent, args, ctx) => {
			console.log('ingredientAggregate');
			const ingredientsCount = await ctx.prisma.ingredientsConnection().aggregate().count();
			const newIngredientsCount = await ctx.prisma.ingredientsConnection({ where: { isValidated: false } }).aggregate().count();

			return {
				ingredientsCount,
				newIngredientsCount,
			};
		},
		ingredient: async (parent, args, ctx) => {
			const { where } = args || {};
			const { id } = where || {};
			return ctx.prisma.ingredient({ id }).$fragment(GET_ALL_INGREDIENT_FIELDS);
		},
		ingredients: async (parent, args, ctx) => {
			console.warn('ingredients');
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

		deleteIngredient: async () => {
			console.log('deleteIngredient');
			// TODO
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
				console.log('!!ERROR');
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
