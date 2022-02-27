import Evernote from 'evernote';
import { getSession } from 'next-auth/client';
import { extendType, nullable, objectType, stringArg } from 'nexus';

const client = new Evernote.Client({
  consumerKey: process.env.API_CONSUMER_KEY,
  consumerSecret: process.env.API_CONSUMER_SECRET,
  sandbox: !!process.env.SANDBOX,
  china: !!process.env.CHINA,
});

type EvernoteRequestErrorProps = {
  statusCode: number
  data?: unknown
};

type EvernoteResponseProps = {
  evernoteAuthToken?: string
  evernoteAuthSecret?: string
  evernoteReqToken?: string
  evernoteReqSecret?: string
};

const requestEvernoteAuthToken = (
  evernoteReqToken?: string,
  evernoteReqSecret?: string,
  oauthVerifier?: string
) : Promise<EvernoteResponseProps> =>
  new Promise((resolve, reject) => {
    const cb = (err: EvernoteRequestErrorProps, evernoteAuthToken: string) => {
      if (err) {
        reject(err);
      }
      resolve({ evernoteAuthToken });
    };

    client.getAccessToken(`${evernoteReqToken}`, `${evernoteReqSecret}`, `${oauthVerifier}`, cb);
  });

const requestEvernoteRequestToken = (): Promise<EvernoteResponseProps> =>
  new Promise((resolve, reject) => {
    console.log('requestEvernoteRequestToken')
    const cb = (err: EvernoteRequestErrorProps, evernoteReqToken: string, evernoteReqSecret: string) => {
      if (err) {
        reject(err);
      }
      resolve({ evernoteReqToken, evernoteReqSecret });
    };

    client.getRequestToken(`${process.env.OAuthCallback}`, cb);
  });


  // Type definitions
export const AuthenticationResponse = objectType({
  name: 'AuthenticationResponse',
  definition(t) {
    t.string('authURL');
    t.string('errorMessage');
    t.boolean('isAuthPending');
    t.boolean('isAuthenticated');
  }
});

export const ImportLocalResponse = objectType({
  name: 'ImportLocalResponse',
  definition(t) {
    t.string('errorMessage');
  }
});

// Mutations
export const AuthenticateEvernote = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('authenticateEvernote', {
      type: 'AuthenticationResponse',
      args: {
        oauthVerifier: nullable(stringArg()),
      },
      resolve: async (_parent, args, ctx) => {
        console.error('authenticateEvernote');
        const { oauthVerifier } = args;
        const { prisma, req } = ctx;
        const {
          evernoteAuthToken = null,
          evernoteReqToken = null,
          evernoteReqSecret = null,
          userId = 0,
        } = await getSession({ req }) || {};
        const id = Number(userId);

        const response = {
          errorMessage: '',
          isAuthPending: false,
          isAuthenticated: false,
          authURL: '',
        };

        console.error({ evernoteAuthToken, evernoteReqToken });

        if (id < 1 || id === null || id === undefined || isNaN(id)) {
          response.errorMessage = 'No userId in session';
          console.error('returning');
          return response;
        }

        console.error({ evernoteAuthToken, evernoteReqSecret, oauthVerifier });

        if (!evernoteReqToken) {
          try {
            const { evernoteReqToken, evernoteReqSecret } = await requestEvernoteRequestToken();
            console.error({ evernoteReqToken, evernoteReqSecret, client });
            response.authURL = evernoteReqToken ? client.getAuthorizeUrl(evernoteReqToken) : '';
            response.isAuthPending = !!response.authURL.length;

            // TODO can we just update the session directly instead of tying this to the user?
            await prisma.user.update({
              data: { evernoteReqToken, evernoteReqSecret },
              where: { id },
            });
          } catch (err: unknown) {
            console.error({ err });
            response.errorMessage = JSON.stringify(err, null, 2);
          }
        }

        if (oauthVerifier && evernoteReqToken && evernoteReqSecret) {
          try {
            const { evernoteAuthToken } = await requestEvernoteAuthToken(
              `${evernoteReqToken}`,
              `${evernoteReqSecret}`,
              `${oauthVerifier}`,
            );
            response.isAuthenticated = !!evernoteAuthToken;

            await prisma.user.update({
              data: { evernoteAuthToken },
              where: { id },
            });
          } catch (err: unknown) {
            response.errorMessage = `${err}`;
          }
        }

        return response;
      },
    });
  },
});

export const ClearAuthentication = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('clearAuthentication', {
      type: 'AuthenticationResponse',
      args: {},
      resolve: async(_parent, args, ctx) => {
        console.log('clearAuthentication', { ctx });
        const { req } = ctx;
        const session = await getSession({ req }) || {};
        const id = Number(session.userId ?? 0);

        const response = {
          errorMessage: '',
          isAuthPending: false,
          isAuthenticated: false,
          authURL: '',
        };
        session.evernoteAuthToken = null;
        session.evernoteReqToken = null;
        session.evernoteReqSecret = null;

        try {
          await ctx.prisma.user.update({
            data: { evernoteAuthToken: null, evernoteReqToken: null, evernoteReqSecret: null },
            where: { id },
          });
        } catch (err: unknown) {
          response.errorMessage = `${err}`;
        }
        return response;
      },
    });
  },
});

export const ImportLocal = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('importLocal', {
      type: 'ImportLocalResponse',
      args: {},
      resolve: async () => {
        console.log('resolve');
        const response = {
          errorMessage: '',
        };

        return response;
      },
    });
  },
});