// @ts-nocheck
import { getSession } from 'next-auth/client';

import { downloadNotes } from './utils/evernote';

import { Session } from '../../components/note-importer/types';

export const importNotes = async (_parent, _args, ctx) => {
  console.log('importNotes');
  const { req } = ctx;
  const { evernoteAuthToken, expires }: Session = await getSession({ req }) || {};
  const isAuthenticated = evernoteAuthToken && new Date(`${expires}`) > new Date();
  const response = {
    errors: [],
    notes: [],
  };

  if (!isAuthenticated) {
    response.errors.push('User is not authenticated.');
    return response;
  }

  const notes = await downloadNotes(ctx)
    .catch((errors) => {
      response.errors = [...errors];
    });

  response.notes = notes;

  console.log({ response });
  return response;
};