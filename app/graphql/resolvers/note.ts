import { getSession } from 'next-auth/client';

import { downloadNotes } from './utils/evernote';

export const importNotes = async (_parent, _args, ctx) => {
  const { req } = ctx;
  const { evernoteAuthToken, expires } = await getSession({ req }) || {};
  const isAuthenticated = evernoteAuthToken && new Date(expires) > new Date();
  const response = {
    errors: [],
    notes: [],
  };

  if (!isAuthenticated) {
    response.errors.push('User is not authenticated.');
    return response;
  }

  const notes = await downloadNotes(ctx)
    .catch((err) => {
      console.log({ err });
      response.errors.push({ err });
    });
  console.log({ notes });

  return response;
};