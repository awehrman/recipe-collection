import Evernote from 'evernote';
import { getSession } from 'next-auth/client';
import { Session } from 'next-auth';
// import { useRouter } from 'next/router'
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
  evernoteExpiration?: string
}

type SessionUserProps = {
  evernoteAuthToken?: string
  evernoteAuthSecret?: string
  evernoteReqToken?: string
  evernoteReqSecret?: string
  evernoteExpiration?: string
  userId?: number
}

type Results = {
  edam_expires: string
}

const requestEvernoteAuthToken = (
  evernoteReqToken?: string,
  evernoteReqSecret?: string,
  oauthVerifier?: string
) : Promise<EvernoteResponseProps> =>
  new Promise((resolve, reject) => {
    const cb = (err: EvernoteRequestErrorProps, evernoteAuthToken: string, _secret: string, results: Results) => {
      if (err) {
        reject(err);
      }
      resolve({ evernoteAuthToken, evernoteExpiration: `${results?.edam_expires}` });
    };

    client.getAccessToken(`${evernoteReqToken}`, `${evernoteReqSecret}`, `${oauthVerifier}`, cb);
  });

const requestEvernoteRequestToken = (): Promise<EvernoteResponseProps> =>
  new Promise((resolve, reject) => {
    const cb = (err: EvernoteRequestErrorProps, evernoteReqToken: string, evernoteReqSecret: string) => {
      if (err) {
        reject(err);
      }
      resolve({ evernoteReqToken, evernoteReqSecret });
    };

    // TODO should this actually point to /api/auth/evernoteCallback?
    // const router = useRouter();
    // // `${process.env.OAuthCallback}`
    // console.log(`${router.pathname}/api/auth/evernoteCallback`);
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
    t.string('evernoteAuthToken');
    t.string('evernoteReqToken');
    t.string('evernoteReqSecret');
    t.string('evernoteExpiration');
  }
});

export const ImportLocalResponse = objectType({
  name: 'ImportLocalResponse',
  definition(t) {
    t.string('errorMessage');
  }
});

// TODO move these resolvers into their own folder
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
        console.log('>>>');
        const { oauthVerifier } = args;
        const { prisma, req } = ctx;
        const session: Session | null = await getSession({ req });

        const user: SessionUserProps = session?.user || {};
        const {
          evernoteReqToken,
          evernoteReqSecret,
          userId,
        } = user;
        const id = Number(userId);

        const response = {
          errorMessage: '',
          isAuthPending: false,
          isAuthenticated: false,
          authURL: '',
          evernoteExpiration: '',
        };

        if (id < 1 || id === null || id === undefined || isNaN(id)) {
          response.errorMessage = 'No userId in session';
          return response;
        }

        if (!evernoteReqToken) {
          try {
            const { evernoteReqToken, evernoteReqSecret } = await requestEvernoteRequestToken();
            response.authURL = evernoteReqToken ? client.getAuthorizeUrl(evernoteReqToken) : '';
            response.isAuthPending = !!response.authURL.length;

            await prisma.user.update({
              data: { evernoteReqToken, evernoteReqSecret },
              where: { id },
            });
          } catch (err: unknown) {
            response.errorMessage = JSON.stringify(err, null, 2);
          }
        }

        console.log({ oauthVerifier, evernoteReqToken, evernoteReqSecret });
        if (oauthVerifier && evernoteReqToken && evernoteReqSecret) {
          try {
            const { evernoteAuthToken, evernoteExpiration } = await requestEvernoteAuthToken(
              `${evernoteReqToken}`,
              `${evernoteReqSecret}`,
              `${oauthVerifier}`,
            );
            response.isAuthenticated = !!evernoteAuthToken;

            console.log('updating evernoteAuthToken and exp')
            await prisma.user.update({
              data: { evernoteAuthToken, evernoteExpiration },
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
        const { req } = ctx;
        const session: Session = await getSession({ req });
        const { user } = session || {};
        const id = Number(user?.userId ?? 0);

        const response = {
          errorMessage: '',
          isAuthPending: false,
          isAuthenticated: false,
          evernoteExpiration: null,
          authURL: '',
          evernoteAuthToken: null,
          evernoteReqToken: null,
          evernoteReqSecret: null,
        };

        try {
          await ctx.prisma.user.update({
            data: {
              evernoteAuthToken: null,
              evernoteReqToken: null,
              evernoteReqSecret: null,
              evernoteExpiration: null,
            },
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
        const response = {
          errorMessage: '',
        };

        return response;
      },
    });
  },
});