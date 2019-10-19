import { GET_ALL_TAG_FIELDS } from '../graphql/fragments';

export default {
	Query: {
		tagAggregate: async (parent, args, ctx) => {
			const tagsCount = await ctx.prisma.tagsConnection().aggregate().count();

			return {
				tagsCount,
				newIngredientsCount,
			};
		},
		tag: (parent, args, ctx) => ctx.prisma.tag({ id: args.id }),
		tags: (parent, args, ctx) => ctx.prisma.tags(),
	},

	Mutation: {
		createTag: async (parent, args, ctx, info) => {
			console.log('createTag');
			const response = {
				__typename: 'TagResponse',
				ingredient: null,
				errors: [],
			};

			const { data } = args;
			// TODO add in joi validation

			try {
				const { id } = await ctx.prisma.createTag({ ...data }, info);
				const tag = await ctx.prisma.tag({ id }).$fragment(GET_ALL_TAG_FIELDS);
				response.tag = {
					__typename: 'Tag',
					...tag,
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

		deleteTag: async (parent, args, ctx, info) => {
			console.log('deleteTag');
			const response = {
				__typename: 'TagResponse',
				tag: null,
				errors: [],
			};

			const { where } = args;
			// TODO add in joi validation

			try {
				await ctx.prisma.deleteTag({ where }, info);
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

		updateTag: async (parent, args, ctx, info) => {
			console.log('updateTag');
			const response = {
				__typename: 'TagResponse',
				tag: null,
				errors: [],
			};

			const { data, where } = args;
			// TODO add in joi validation

			try {
				const { id } = await ctx.prisma.updateTag({
					data,
					where,
				}, info);
				const tag = await ctx.prisma.tag({ id }).$fragment(GET_ALL_TAG_FIELDS);
				response.tag = {
					__typename: 'Tag',
					...tag,
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
