import Evernote from 'evernote';
import { getSession } from 'next-auth/client';
// import jwt from 'next-auth/jwt';
import { mutationType, nullable, stringArg } from '@nexus/schema';
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

const requestEvernoteAuthToken = (
  evernoteReqToken: string,
  evernoteReqSecret: string,
  oauthVerifier: string
) : Promise<EvernoteResponseProps> =>
  new Promise((resolve, reject) => {
    const cb = (err: EvernoteRequestErrorProps, evernoteAuthToken: string) => {
      if (err) {
        reject(err);
      }
      resolve({ evernoteAuthToken });
    };

    client.getAccessToken(evernoteReqToken, evernoteReqSecret, oauthVerifier, cb);
  });

const requestEvernoteRequestToken = (): Promise<EvernoteResponseProps> =>
  new Promise((resolve, reject) => {
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
      args: { oauthVerifier: nullable(stringArg()) },
      resolve: async (_parent, args, ctx): Promise<NexusGenRootTypes['AuthenticationResponse']> => {
        const { oauthVerifier } = args;
        const { req } = ctx;
        // const secret = process.env.JWT_SECRET;
        // const token = await jwt.getToken({ req, secret });
        // const id = Number(token?.userId || 0);
        const session = await getSession({ req });
        const id = Number(session?.userId || 0);

        const user = await ctx.prisma.user.findUnique({ where: { id }});
        const isClientTokenSet = !!user.evernoteAuthToken;

        const response = {
          id,
          errorMessage: '',
          isAuthPending: false,
          isAuthenticated: false,
          authURL: '',
        };

        if (!id || !session) {
          response.errorMessage = !id ? 'No userId in session' : 'No session available';
          return response;
        }

        // otherwise, we need to start the authentication
        if (!isClientTokenSet && !oauthVerifier && (!user?.evernoteReqToken || !response.authURL.length)) {
          try {
            const { evernoteReqToken, evernoteReqSecret } = await requestEvernoteRequestToken();
            response.authURL = evernoteReqToken ? client.getAuthorizeUrl(evernoteReqToken) : '';
            response.isAuthPending = !!response.authURL.length;

            // TODO i should probably move this into its own jwt token
            // but for the meantime, just update this user information
            const updateUserReqToken = {
              data: {
                evernoteReqToken,
                evernoteReqSecret,
              },
              where: { id },
            };
            await ctx.prisma.user.update(updateUserReqToken);
          } catch (err: unknown) {
            response.errorMessage = `${err}`;
          }
        }

        if (oauthVerifier && user?.evernoteReqToken && user?.evernoteReqSecret) {
          try {
            const { evernoteAuthToken } = await requestEvernoteAuthToken(
              `${user.evernoteReqToken}`,
              `${user.evernoteReqSecret}`,
              `${oauthVerifier}`
            );
            response.isAuthenticated = !!evernoteAuthToken;
            session.evernoteAuthToken = evernoteAuthToken;

            await ctx.prisma.user.update({
              data: { evernoteAuthToken },
              where: { id },
            });
          } catch (err: unknown) {
            response.errorMessage = `${err}`;
          }
        }

        console.log({ isClientTokenSet });
        return response;
      }
    });

    t.crud.createOneUser();
    t.crud.deleteOneUser();
    t.crud.updateOneUser();
  }
});

export default Mutation;