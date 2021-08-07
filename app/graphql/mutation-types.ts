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
  evernoteReqToken?: string
  evernoteReqSecret?: string
};

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
        // const { oauthVerifier } = args;
        // const isClientTokenSet = Boolean(client?.token);

        const { req } = ctx;
        const session = await getSession({ req });
        // check if our user already has an evernote auth token
        const id = Number(session?.userId || 0);

        const response = {
          id,
          errors: session?.userId ? ['No userId in session'] : [],
          isAuthPending: !!session?.evernoteReqToken,
          isAuthenticated: !!session?.evernoteAuthToken,
          authURL: '',
        };

        // // otherwise, we need to start the authentication
        if (!session?.evernoteReqToken || !response.authURL.length) {
          try {
            const evernote = await requestEvernoteRequestToken();
            response.authURL = evernote?.evernoteReqToken ? client.getAuthorizeUrl(evernote.evernoteReqToken) : '';
            response.isAuthPending = !!response.authURL.length;
            response.isAuthenticated = false;
          } catch (err: unknown) {
            response.errors.push(`${err}`);
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