// @ts-nocheck
import { AuthenticationError } from 'apollo-server-micro';
import { getSession } from 'next-auth/client';

import { downloadNotes } from './utils/evernote';

import { Session } from '../../components/note-importer/types';

export const importNotes = async (_parent, _args, ctx) => {
  const { req } = ctx;
  const { evernoteAuthToken, evernoteExpiration }: Session = await getSession({ req }) || {};
  const isAuthenticated = evernoteAuthToken && new Date(`${evernoteExpiration}`) > new Date();
  const response = {
    error: null,
    notes: [],
  };

  if (!isAuthenticated) {
    throw new AuthenticationError;
  }

  response.notes = await downloadNotes(ctx)
    .catch(err => {
      response.error = err.message;
    });

  return response;
};