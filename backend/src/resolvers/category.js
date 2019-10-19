import { GET_ALL_CATEGORY_FIELDS } from '../graphql/fragments';

export default {
	Query: {
		categoryAggregate: async (parent, args, ctx) => {
			const categoriesCount = await ctx.prisma.categoriesConnection().aggregate().count();

			return {
				categoriesCount,
				newIngredientsCount,
			};
		},
		category: (parent, args, ctx) => ctx.prisma.category({ id: args.id }),
		categories: (parent, args, ctx) => ctx.prisma.categories(),
	},

	Mutation: {
		createCategory: async (parent, args, ctx, info) => {
			console.log('createCategory');
			const response = {
				__typename: 'CategoryResponse',
				ingredient: null,
				errors: [],
			};

			const { data } = args;
			// TODO add in joi validation

			try {
				const { id } = await ctx.prisma.createCategory({ ...data }, info);
				const category = await ctx.prisma.category({ id }).$fragment(GET_ALL_CATEGORY_FIELDS);
				response.category = {
					__typename: 'Category',
					...category,
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

		deleteCategory: async (parent, args, ctx, info) => {
			console.log('deleteCategory');
			const response = {
				__typename: 'CategoryResponse',
				category: null,
				errors: [],
			};

			const { where } = args;
			// TODO add in joi validation

			try {
				await ctx.prisma.deleteCategory({ where }, info);
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

		updateCategory: async (parent, args, ctx, info) => {
			console.log('updateCategory');
			const response = {
				__typename: 'CategoryResponse',
				category: null,
				errors: [],
			};

			const { data, where } = args;
			// TODO add in joi validation

			try {
				const { id } = await ctx.prisma.updateCategory({
					data,
					where,
				}, info);
				const category = await ctx.prisma.category({ id }).$fragment(GET_ALL_CATEGORY_FIELDS);
				response.category = {
					__typename: 'Category',
					...category,
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
