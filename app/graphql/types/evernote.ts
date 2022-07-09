import { objectType } from 'nexus';

export const EvernoteResponse = objectType({
  name: 'EvernoteResponse',
  definition(t) {
    t.nullable.string('error');
    t.list.field('notes', { type: 'Note' });
  },
});