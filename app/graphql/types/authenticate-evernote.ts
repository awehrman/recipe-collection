import { extendType, FieldResolver, nullable, objectType, stringArg } from 'nexus';

import {
  resolveAuthenticateEvernote,
  resolveClearAuthentication,
} from '../resolvers/authenticate-evernote';

// Response Types
export const AuthenticationResponse = objectType({
  name: 'AuthenticationResponse',
  definition(t) {
    t.string('authURL');
    t.string('errorMessage');
    t.boolean('isAuthPending');
    t.boolean('isAuthenticated');
    t.string('evernoteAuthToken');
    t.string('evernoteReqToken');
    t.string('evernoteReqSecret');
    t.string('evernoteExpiration');
  },
});

// Mutations
export const AuthenticateEvernote = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('authenticateEvernote', {
      type: 'AuthenticationResponse',
      args: { oauthVerifier: nullable(stringArg()) },
      // man idk wtf is up with these fucking types
      resolve: (resolveAuthenticateEvernote) as FieldResolver<"Mutation", "authenticateEvernote">,
    });
  },
});

export const ClearAuthentication = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('clearAuthentication', {
      type: 'AuthenticationResponse',
      args: {},
      // like why is this not screaming at me!?
      resolve: resolveClearAuthentication,
    });
  },
});
