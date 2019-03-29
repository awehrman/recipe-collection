export default {
	Query: {
		tag: (parent, args, ctx) => ctx.prisma.tag({ id: args.id }),
		tags: (parent, args, ctx) => ctx.prisma.tags(),
	},

	Mutation: {
		createTag: async (parent, args, ctx) => {
			console.log('createTag');
			const tag = await ctx.prisma.createTag({ data: { ...args } });
			console.log(tag);
			return tag;
		},

		deleteTag: async () => {
			console.log('deleteTag');
			// TODO
		},

		updateTag: async () => {
			console.log('updateTag');
			// TODO
		},
	},
};
