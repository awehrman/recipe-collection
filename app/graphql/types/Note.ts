import { enumType, extendType, idArg, objectType } from 'nexus';

import { getNotesMeta, importNotes, parseNotes, saveRecipes } from '../resolvers/note';
import { resetDatabase } from '../resolvers/admin-tools';

export const Note = objectType({
  name: 'Note',
  definition(t) {
    t.int('id');
    // TODO https://nexusjs.org/docs/api/scalar-type
    t.string('createdAt');
    t.string('updatedAt');
    t.nonNull.string('evernoteGUID');
    t.nonNull.string('title');
    t.string('source');
    // categories: string[]
    // tags: string[]
    t.string('image');
    t.string('content');
    t.boolean('isParsed');
    t.list.field('ingredients', {
      type: 'IngredientLine',
      resolve: async (root, _args, ctx) => {
        if (!root?.id) {
          return [];
        }
        const lines = await ctx.prisma.ingredientLine.findMany({
          where: { noteId: root.id },
        });

        return lines;
      },
    });
    t.list.field('instructions', {
      type: 'InstructionLine',
      resolve: async (root, _args, ctx) => {
        if (!root?.id) {
          return [];
        }
        const lines = await ctx.prisma.instructionLine.findMany({
          where: { noteId: root.id },
        });
        return lines;
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

export const EvernoteResponse = objectType({
  name: 'EvernoteResponse',
  definition(t) {
    t.nullable.string('error');
    t.list.field('notes', { type: 'Note' });
  },
});

export const NoteMeta = objectType({
  name: 'NoteMeta',
  definition(t) {
    t.int('id');
    t.nonNull.string('evernoteGUID');
    t.nonNull.string('title');
  },
});

export const StandardResponse = objectType({
  name: 'StandardResponse',
  definition(t) {
    t.nullable.string('error');
    t.list.field('notes', { type: 'NoteMeta' });
  },
});

// NOTE: https://www.prisma.io/blog/using-graphql-nexus-with-a-database-pmyl3660ncst#3-expose-full-crud-graphql-api-via-nexus-prisma
// Queries
export const NotesQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('notes', {
      type: 'Note',
      // TODO fix the nexus auto type gen
      resolve: async (root, _args, ctx) => {
        const data = await ctx.prisma.note.findMany();
        return data;
      },
    });
  },
});

export const NoteQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('note', {
      type: 'Note',
      args: {
        id: idArg(),
      },
      resolve: async (root, args, ctx) => {
        const id = parseInt(`${args.id}`, 10);
        const note = await ctx.prisma.note.findUnique({
          where: { id },
        });

        return {
          note,
        };
      },
    });
  },
});

// Mutations
export const GetNotesMeta = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('getNotesMeta', {
      type: 'EvernoteResponse',
      resolve: getNotesMeta,
    });
  },
});

// deprecated
export const ImportNotes = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('importNotes', {
      type: 'EvernoteResponse',
      resolve: importNotes,
    });
  },
});

// deprecated
export const ParseNotes = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('parseNotes', {
      type: 'EvernoteResponse',
      resolve: parseNotes,
    });
  },
});

export const SaveRecipes = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('saveRecipes', {
      type: 'EvernoteResponse',
      resolve: saveRecipes,
    });
  },
});

export const ResetDatabase = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('resetDatabase', {
      type: 'EvernoteResponse',
      resolve: resetDatabase,
    });
  },
});
