import { getSession } from 'next-auth/client';
import { extendType, objectType } from 'nexus';

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