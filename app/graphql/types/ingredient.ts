import { enumType, extendType, idArg, objectType } from 'nexus';

export const Ingredient = objectType({
  name: 'Ingredient',
  definition(t) {
    t.int('id');
    t.string('createdAt');
    t.string('updatedAt');
    t.string('name');
    t.string('plural');
    t.boolean('isComposedIngredient');
    t.boolean('isValidated');
    t.list.field('alternateNames', {
      type: 'AlternateName',
      resolve: async (root, _args, ctx) => {
        if (!root?.id) {
          return [];
        }
        const names = await ctx.prisma.alternateName.findMany({
          where: { ingredientId: root.id },
        });
        return names;
      },
    });
    t.list.field('properties', {
      type: 'Property',
      resolve: async (root, _args, ctx) => {
        if (!root?.id) {
          return [];
        }
        // i wonder if there's a better way to define this in nexus :\
        const response = await ctx.prisma.ingredient.findUnique({
          where: { id: root.id },
          select: { properties: true },
        });
        return response?.properties ?? [];
      },
    });
    t.field('parent', {
      type: 'Ingredient',
      resolve: async (root, _args, ctx) => {
        if (!root?.id) {
          return [];
        }
        const parent = await ctx.prisma.ingredient.findUnique({
          where: { id: root.id },
          select: {
            parent: {
              select: {
                id: true,
                name: true,
                isValidated: true,
              },
            },
          },
        });
        return parent;
      },
    });
    t.list.field('relatedIngredients', {
      type: 'Ingredient',
      resolve: async (root, _args, ctx) => {
        if (!root?.id) {
          return [];
        }
        const response = await ctx.prisma.ingredient.findMany({
          where: { id: root.id },
          select: {
            relatedIngredients: {
              select: {
                id: true,
                name: true,
                isValidated: true,
              },
            },
          },
        });
        const related = response.flatMap((s) => s.relatedIngredients);
        return related;
      },
    });
    t.list.field('substitutes', {
      type: 'Ingredient',
      resolve: async (root, _args, ctx) => {
        if (!root?.id) {
          return [];
        }
        const response = await ctx.prisma.ingredient.findMany({
          where: { id: root.id },
          select: {
            substitutes: {
              select: {
                id: true,
                name: true,
                isValidated: true,
              },
            },
          },
        });
        const substitutes = response.flatMap((s) => s.substitutes);
        return substitutes;
      },
    });
    t.list.field('references', {
      type: 'IngredientLine',
      resolve: async (root, _args, ctx) => {
        if (!root?.id) {
          return [];
        }
        const response = await ctx.prisma.ingredient.findMany({
          where: { id: root.id },
          select: {
            references: {
              select: {
                id: true,
                reference: true,
              },
            },
          },
        });
        const references = response.flatMap((r) => r.references);
        return references;
      },
    });
  },
});

export const Property = enumType({
  name: 'Property',
  members: ['MEAT', 'POULTRY', 'FISH', 'DAIRY', 'SOY', 'GLUTEN'],
});

export const AlternateName = objectType({
  name: 'AlternateName',
  definition(t) {
    t.string('name');
    t.int('ingredientId');
  },
});

export const IngredientLine = objectType({
  name: 'IngredientLine',
  definition(t) {
    t.int('id');
    t.string('createdAt');
    t.string('updatedAt');
    t.int('blockIndex');
    t.int('lineIndex');
    t.string('reference');
    t.string('rule');
    t.boolean('isParsed');
    t.list.field('parsed', {
      type: 'ParsedSegment',
      resolve: async (root, _args, ctx) => {
        if (!root?.id) {
          return [];
        }
        const lines = await ctx.prisma.parsedSegment.findMany({
          where: { ingredientLineId: root.id },
        });
        return lines;
      },
    });
    // recipe
    // recipeId
    // note
    // noteId
  },
});

export const ParsedSegment = objectType({
  name: 'ParsedSegment',
  definition(t) {
    t.int('id');
    t.string('createdAt');
    t.string('updatedAt');
    t.int('index');
    t.nullable.field('ingredient', {
      type: 'Ingredient',
      resolve: async (root, _args, ctx) => {
        if ((root?.type && root.type !== 'ingredient') || !root?.ingredientId) {
          return null;
        }
        const data = await ctx.prisma.ingredient.findUnique({
          where: { id: +root.ingredientId },
        });
        return {
          id: data?.id,
          name: data?.name,
          plural: data?.plural,
        };
      },
    });
    t.string('rule');
    t.string('type');
    t.string('value');
    t.nullable.int('ingredientId');
    t.nullable.int('ingredientLineId');
  },
});

export const InstructionLine = objectType({
  name: 'InstructionLine',
  definition(t) {
    t.int('id');
    t.string('createdAt');
    t.string('updatedAt');
    t.int('blockIndex');
    t.string('reference');
    // recipe
    // recipeId
    // note
    // noteId
  },
});

export const IngredientQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('ingredient', {
      type: 'Ingredient',
      args: {
        id: idArg(),
      },
      resolve: async (root, args, ctx) => {
        const id = parseInt(`${args.id}`, 10);
        const ingredient = await ctx.prisma.ingredient.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            isValidated: true,
          }
        });

        return {
          ingredient,
        };
      },
    });
  },
});

export const IngredientsQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('ingredients', {
      type: 'Ingredient',
      resolve: async (root, _args, ctx) => {
        const data = await ctx.prisma.ingredient.findMany({
          select: {
            id: true,
            name: true,
            isValidated: true,
          }
        });
        return data;
      },
    });
  },
});
