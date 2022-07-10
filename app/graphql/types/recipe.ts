import { extendType, idArg, objectType } from 'nexus';

export const Recipe = objectType({
  name: 'Recipe',
  definition(t) {
    t.int('id');
    t.string('title');
  },
});

export const RecipeQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('recipe', {
      type: 'Recipe',
      args: {
        id: idArg(),
      },
      resolve: async (root, args, ctx) => {
        const id = parseInt(`${args.id}`, 10);
        const recipe = await ctx.prisma.recipe.findUnique({
          where: { id },
          select: {
            id: true,
            title: true,
          }
        });

        return {
          recipe,
        };
      },
    });
  },
});

export const RecipesQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('recipes', {
      type: 'Recipe',
      resolve: async (root, _args, ctx) => {
        const data = await ctx.prisma.recipe.findMany({
          select: {
            id: true,
            title: true,
          }
        });
        return data;
      },
    });
  },
});
