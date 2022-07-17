import { stringArg, extendType, objectType } from 'nexus';

import { buildContainers } from './helpers/container';

export const Container = objectType({
  name: 'Container',
  definition(t) {
    t.string('id');
    t.string('name');
    t.int('count');
    t.boolean('isExpanded');
    t.list.field('ingredients', {
      type: 'Ingredient',
      resolve: async (root) => root?.ingredients ?? [],
    });
  },
});

// TODO add in currentContainerIngredientId
export const ContainersQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('containers', {
      type: 'Container',
      args: { group: stringArg(), view: stringArg() },
      resolve: async (_root, args, ctx) => {
        const { group = 'name', view = 'all' } = args;
        const { prisma } = ctx;
        const where = view === 'new' ? { isValidated: false } : {};
        const ingredients = await prisma.ingredient.findMany({
          where,
          select: {
            id: true,
            name: true,
            parentId: true,
            references: {
              select: {
                id: true,
              }
            }
          }
        });
        if (!ingredients.length) {
          return [];
        }
        const containers = buildContainers({ group, ingredients, view });
        // TODO create other containers per group
        return containers;
      },
    });
  },
});
