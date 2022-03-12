// @ts-nocheck
import { AuthenticationError } from 'apollo-server-micro';
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
    throw new AuthenticationError;
  }

    response.notes = await downloadNotes(ctx)
      .catch(err => {
        console.error(err);
        response.errors = [err.message];
      });

  console.log({ response });
  return response;
};