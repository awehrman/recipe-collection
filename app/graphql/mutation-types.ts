import { getSession } from 'next-auth/client';
import { intArg, mutationType, nullable, stringArg } from '@nexus/schema';
import Evernote from 'evernote';

const client = new Evernote.Client({
	consumerKey: process.env.API_CONSUMER_KEY,
	consumerSecret: process.env.API_CONSUMER_SECRET,
	sandbox: !!process.env.SANDBOX,
	china: !!process.env.CHINA,
});

// TODO import these from elsewhere
const resolveRequestToken = async ({ ctx, response, session }) => {
	console.log('resolveRequestToken', process.env.OAuthCallback);
  client.getRequestToken(process.env.OAuthCallback, async (err, evernoteReqToken, evernoteReqSecret) => {
		console.log(`getRequestToken`, { err, evernoteReqToken, evernoteReqSecret });
		if (err) {
      response.errors.push(err);
      return response;
    }

		response.isAuthPending = true;
		response.isAuthenticated = false;
		response.authURL = client.getAuthorizeUrl(evernoteReqToken);

    const data = {
      evernoteReqToken,
      evernoteReqSecret,
    };
    const where = { id: session.userId };
		const res = await ctx.prisma.user.update({ data, where });
    console.log({ res });

		return response;
	});
};

// const resolveAccessToken = (req, response, requestToken, requestTokenSecret, oauthVerifier) =>
//   new Promise((resolve, reject) => {
// 	console.log('resolveAccessToken');
// 	client.getAccessToken(requestToken, requestTokenSecret, oauthVerifier, (err, authToken, authTokenSecret) => {
// 		console.log({ err });
// 		if (err) {reject(err);}

// 		response.isAuthenticated = true;
// 		response.isAuthenticationPending = false;

// 		// req.session.authToken = authToken;
// 		// req.session.authTokenSecret = authTokenSecret;
// 		// req.session.requestToken = null;
// 		// req.session.requestTokenSecret = null;

// 		resolve(response);
// 	});
// });

const Mutation = mutationType({
  definition(t) {
    t.field('authenticateEvernote', {
      type: 'AuthenticationResponse',
      args: {
        oauthVerifier: nullable(stringArg()),
      },
      async resolve(_parent, args, ctx) {
        // const { oauthVerifier } = args;
        // const isClientTokenSet = Boolean(client?.token);
        // console.log('do i have anything in my session? or even a request?');
        const { req, prisma } = ctx;
        const session = await getSession({ req });
        console.log({ session });
        // check if our user already has an evernote auth token

        const response = {
          // id: uuid.v4(), get this from the db
          id: session?.userId,
          errors: [],
          isAuthPending: !!session?.evernoteReqToken,
          isAuthenticated: !!session?.evernoteAuthToken,
          authURL: null,
        };

        // response.isAuthenticated = isClientTokenSet || Boolean(authToken);
        // response.isAuthPending = Boolean((!isClientTokenSet && !authToken) && requestToken);

        // // // if we've passed an oauthVerifier, then we need to finish up the pending authentication
        // if (oauthVerifier) {
        //   return resolveAccessToken(req, response, requestToken, requestTokenSecret, oauthVerifier);
        // }

        // // otherwise, we need to start the authentication
        if (!session?.evernoteReqToken) {
          return resolveRequestToken({ ctx, response, session });
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