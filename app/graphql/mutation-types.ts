import { getSession } from 'next-auth/client';
import { mutationType, nullable, stringArg } from '@nexus/schema';
import Evernote from 'evernote';
import { NexusGenRootTypes } from '../generated/nexus-typegen';

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

// TODO move these to a separate file
const requestEvernoteAuthToken = (evernoteReqToken: string, evernoteReqSecret: string, oauthVerifier: string)
  : Promise<EvernoteResponseProps> =>
    new Promise((resolve, reject) => {
      console.log('requestEvernoteAuthToken');
      const cb = (err: EvernoteRequestErrorProps, evernoteAuthToken: string) => {
        if (err) {
          reject(err);
        }
        console.log({ evernoteAuthToken });
        resolve({ evernoteAuthToken });
      };

      client.getAccessToken(evernoteReqToken, evernoteReqSecret, oauthVerifier, cb);
    });

const requestEvernoteRequestToken = (): Promise<EvernoteResponseProps> => new Promise((resolve, reject) => {
  const cb = (err: EvernoteRequestErrorProps, evernoteReqToken: string, evernoteReqSecret: string) => {
    if (err) {
      reject(err);
    }
    resolve({ evernoteReqToken, evernoteReqSecret });
  };

  client.getRequestToken(`${process.env.OAuthCallback}`, cb);
});

const Mutation = mutationType({
  definition(t) {
    t.field('authenticateEvernote', {
      type: 'AuthenticationResponse',
      args: {
        oauthVerifier: nullable(stringArg()),
      },
      resolve: async (_parent, args, ctx): Promise<NexusGenRootTypes['AuthenticationResponse']> => {
        const { oauthVerifier } = args;
        const { req } = ctx;
        const session = await getSession({ req });
        const id = Number(session?.userId || 0);
        const user = await ctx.prisma.user.findUnique({ where: { id }});

        const isClientTokenSet = !!client?.token;
        console.log({ isClientTokenSet });

        const response = {
          id,
          errors: !id ? ['No userId in session'] : [],
          isAuthPending: !isClientTokenSet || !!user?.evernoteReqToken,
          isAuthenticated: isClientTokenSet || !!user?.evernoteAuthToken,
          authURL: '',
        };

        // otherwise, we need to start the authentication
        if (!isClientTokenSet && !oauthVerifier && (!user?.evernoteReqToken || !response.authURL.length)) {
          try {
            const evernote = await requestEvernoteRequestToken();
            response.authURL = evernote?.evernoteReqToken ? client.getAuthorizeUrl(evernote.evernoteReqToken) : '';
            response.isAuthPending = !!response.authURL.length;
            response.isAuthenticated = false;

            // TODO i should probably move this into its own jwt token
            // but for the meantime, just update this user information
            const updateUserReqToken = {
              data: {
                evernoteReqToken: evernote?.evernoteReqToken,
                evernoteReqSecret: evernote?.evernoteReqSecret,
              },
              where: { id },
            };
            await ctx.prisma.user.update(updateUserReqToken);
          } catch (err: unknown) {
            response.errors.push(`${err}`);
            response.isAuthPending = false;
          }
        }

        if (oauthVerifier && user?.evernoteReqToken && user?.evernoteReqSecret) {
          try {
            const token = await requestEvernoteAuthToken(
              `${user.evernoteReqToken}`,
              `${user.evernoteReqSecret}`,
              `${oauthVerifier}`
            );
            response.isAuthPending = false;
            response.isAuthenticated = true;
              console.log({ token });
            // TODO i should probably move this into its own jwt token
            // but for the meantime, just update this user information
            const updateUserAuthToken = {
              data: { evernoteAuthToken: token?.evernoteAuthToken },
              where: { id },
            };
            await ctx.prisma.user.update(updateUserAuthToken);
          } catch (err: unknown) {
            response.errors.push(`${err}`);
            response.isAuthenticated = false;
          }
        }

        console.log({ response });
        return response;
      }
    });

    t.crud.createOneUser();
    t.crud.deleteOneUser();
    t.crud.updateOneUser();
  }
});

export default Mutation;