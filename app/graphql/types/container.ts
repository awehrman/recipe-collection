import { stringArg, extendType, idArg, objectType } from 'nexus';

export const Container = objectType({
  name: 'Container',
  definition(t) {
    t.string('id');
    t.string('name');
    t.int('count');
    t.list.field('ingredients', {
      type: 'Ingredient',
      resolve: async (root) => root?.ingredients ?? [],
    });
  },
});

export const ContainersQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('containers', {
      type: 'Container',
      args: { group: stringArg(), view: stringArg() },
      resolve: async (_root, args, ctx) => {
        console.log('containers', { _root });
        const { group = 'name', view = 'all' } = args;
        const { prisma } = ctx;
        const where = view === 'new' ? { isValidated: false } : {};
        const ingredients = await prisma.ingredient.findMany({
          where,
          select: {
            id: true,
            name: true,
          }
        });
        const containers = [];

        containers.push({
          id: `container_0`,
          name: view === 'new' ? 'New Ingredients' : 'All Ingredients',
          count: ingredients.length,
          ingredients,
        });
        console.log({ containers })
        // TODO create other containers per group
        return containers;
      },
    });
  },
});
