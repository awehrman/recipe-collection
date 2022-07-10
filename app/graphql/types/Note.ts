import { extendType, idArg, objectType } from 'nexus';

import { getNotesMeta, getNotesContent, getParsedNotes, saveRecipes } from '../resolvers/note';
import { resetDatabase } from '../resolvers/admin-tools';

export const Category = objectType({
  name: 'Category',
  definition(t) {
    t.int('id');
    t.string('name');
    t.string('evernoteGUID');
  },
});

export const Tag = objectType({
  name: 'Tag',
  definition(t) {
    t.int('id');
    t.string('name');
    t.string('evernoteGUID');
  },
});

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
    t.list.field('categories', {
      type: 'Category',
      resolve: async (root, _args, ctx) => {
        if (!root?.id) {
          return [];
        }
        const categories = await ctx.prisma.category.findMany({
          where: { notes: { some: { id: root.id } } },
        });
        return categories;
      },
    });
    t.list.field('tags', {
      type: 'Tag',
      resolve: async (root, _args, ctx) => {
        if (!root?.id) {
          return [];
        }
        const tags = await ctx.prisma.tag.findMany({
          where: { notes: { some: { id: root.id } } },
        });
        return tags;
      },
    });
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

export const GetNotesContent = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('getNotesContent', {
      type: 'EvernoteResponse',
      resolve: getNotesContent,
    });
  },
});

export const GetParsedNotes = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('getParsedNotes', {
      type: 'EvernoteResponse',
      resolve: getParsedNotes,
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
