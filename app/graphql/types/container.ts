import { idArg, stringArg, extendType, objectType, FieldResolver } from 'nexus';

import { buildContainers } from './helpers/container';
import {
  resolveToggleContainer,
  resolveToggleContainerIngredient,
} from '../resolvers/container';

export const Container = objectType({
  name: 'Container',
  definition(t) {
    t.string('id');
    t.nullable.string('name');
    t.nullable.int('count');
    t.nullable.string('currentIngredientId');
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
            isValidated: true,
            properties: true,
            parent: {
              select: {
                id: true,
                name: true,
              },
            },
            references: {
              select: {
                id: true,
              },
            },
          },
        });
        if (!ingredients.length) {
          return [];
        }
        const containers = buildContainers({ group, ingredients, view });
        // does this create a new container every time?
        // we really need to grab this out of the cache if it exists
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
      resolve: resolveToggleContainer as FieldResolver<
        'Mutation',
        'toggleContainer'
      >,
    });
  },
});

export const ToggleContainerIngredient = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('toggleContainerIngredient', {
      type: 'Container',
      args: { containerId: stringArg(), ingredientId: stringArg() },
      // man idk wtf is up with these fucking types
      resolve: resolveToggleContainerIngredient as FieldResolver<
        'Mutation',
        'toggleContainerIngredient'
      >,
    });
  },
});
