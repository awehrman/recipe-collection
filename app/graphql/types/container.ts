import { idArg, stringArg, extendType, objectType, FieldResolver } from 'nexus';

import { buildContainers } from './helpers/container';
import { resolveToggleContainer } from '../resolvers/container';

export const Container = objectType({
  name: 'Container',
  definition(t) {
    t.string('id');
    t.nullable.string('name');
    t.nullable.int('count');
    t.nullable.boolean('isExpanded');
    t.nullable.list.field('ingredients', {
      type: 'Ingredient',
      resolve: async (root) => root?.ingredients ?? [],
    });
  },
});

// Queries
export const ContainerQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('container', {
      type: 'Container',
      args: { id: idArg() },
      resolve: (root, args, ctx) => {
        console.log('container query', { root, args, ctx });
        const id = parseInt(`${args.id}`, 10);
        return { container: { id } };
      },
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
        return containers;
      },
    });
  },
});

// Mutations
export const ToggleContainer = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('toggleContainer', {
      type: 'Container',
      args: { id: stringArg() },
      // man idk wtf is up with these fucking types
      resolve: (resolveToggleContainer) as FieldResolver<"Mutation", "toggleContainer">,
    });
  },
});