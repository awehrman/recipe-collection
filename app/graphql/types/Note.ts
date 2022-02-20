import { extendType, idArg, objectType } from 'nexus';

import { importNotes } from '../resolvers/note';

export const Note = objectType({
  name: 'Note',
  definition(t) {
    t.id('id')
    t.string('content')
    t.string('image')
    t.boolean('isParsed')
    t.string('source')
    t.string('title')
  }
});

export const EvernoteResponse = objectType({
  name: 'EvernoteResponse',
  definition(t) {
    t.list.string('errors');
    t.list.field('notes', { type: 'Note' });
  }
});

// NOTE: https://www.prisma.io/blog/using-graphql-nexus-with-a-database-pmyl3660ncst#3-expose-full-crud-graphql-api-via-nexus-prisma
// Queries
export const NotesQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('notes', {
      type: 'Note',
      resolve(root, args, ctx) {
        return ctx.prisma.note.findMany();
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
      resolve(root, args, ctx) {
        const { id } = args;
        return ctx.prisma.note.findUnique({
          where: { id }
        });
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