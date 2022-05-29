import { extendType, idArg, objectType } from 'nexus';

import { importNotes, parseNotes } from '../resolvers/note';

export const Note = objectType({
  name: 'Note',
  definition(t) {
    t.string('id');
    // TODO https://nexusjs.org/docs/api/scalar-type
    t.string('createdAt');
    t.string('updatedAt');
    t.nonNull.string('evernoteGUID');
    t.nonNull.string('title');
    t.string('source');
    // categories: string[]
    // tags: string[]
    t.string('image');
    t.nonNull.string('content');
    t.nonNull.boolean('isParsed');
//     t.list.field('ingredients', {
//       type: 'IngredientLine',
//       resolve: async (root, _args) => {
//         console.log('resolving ingredient line', { _args });
// //       // const data = await ctx.prisma.note.findMany();
// //       // return data;
//       return {
//         id: '123',
//         createdAt: '123',
//         updatedAt: '123',
//         blockIndex: 0,
//         lineIndex: 0,
//         reference: 'test',
//         rule: 'test',
//         isParsed: false,
//       };
//       },
//     });
    t.list.field('instructions', {
      type: 'InstructionLine',
      resolve: async () => {
        console.log('resolving instruction line...');
//       // const data = await ctx.prisma.note.findMany();
//       // return data;
      return [];
      },
    });
  }
});

export const IngredientLine = objectType({
  name: 'IngredientLine',
  definition(t) {
    t.string('id');
    t.string('createdAt');
    t.string('updatedAt');
    t.string('blockIndex');
    t.int('lineIndex');
    t.string('reference');
    t.string('rule');
    t.boolean('isParsed');
    // parsed
    // recipe
    // note
    // recipeId
    // noteId
  }
});

export const InstructionLine = objectType({
  name: 'InstructionLine',
  definition(t) {
    t.string('id');
    t.string('createdAt');
    t.string('updatedAt');
    t.int('blockIndex');
    t.string('reference');
    // recipe
    // note
    // recipeId
    // noteId
  }
});

export const EvernoteResponse = objectType({
  name: 'EvernoteResponse',
  definition(t) {
    t.nullable.string('error');
    t.list.field('notes', { type: 'Note' });
  }
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
          where: { id }
        });

        return {
          note
        };
      },
    });
  },
});

// Mutations
export const ImportNotes = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('importNotes', {
      type: 'EvernoteResponse',
      resolve: importNotes,
    });
  },
});

export const ParseNotes = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('parseNotes', {
      type: 'EvernoteResponse',
      resolve: parseNotes,
    });
  },
});