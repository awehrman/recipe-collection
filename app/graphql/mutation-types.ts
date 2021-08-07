
import { mutationType, nullable, stringArg } from '@nexus/schema';
import Evernote from 'evernote';

const client = new Evernote.Client({
	consumerKey: process.env.API_CONSUMER_KEY,
	consumerSecret: process.env.API_CONSUMER_SECRET,
	sandbox: !!process.env.SANDBOX,
	china: !!process.env.CHINA,
});

// TODO import these from elsewhere
// const resolveRequestToken = (req, response) => new Promise((resolve, reject) => {
// 	console.log('resolveRequestToken');
// 	client.getRequestToken(process.env.OAuthCallback, (err, requestToken, requestTokenSecret) => {
// 		console.log({ err });
// 		if (err) {
//       reject(err);
//     }

// 		response.isAuthenticationPending = true;
// 		response.isAuthenticated = false;
// 		response.authURL = client.getAuthorizeUrl(requestToken);

// 		req.session.requestToken = requestToken;
// 		req.session.requestTokenSecret = requestTokenSecret;

// 		resolve(response);
// 	});
// });

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
        oauthVerifier: nullable(stringArg())
      },
      resolve(_parent, args, ctx) {
        const { oauthVerifier } = args;
        // const isClientTokenSet = Boolean(client?.token);
        // console.log('do i have anything in my session? or even a request?');
        console.log({ oauthVerifier, ctx });
        // const { res, req, prisma } = ctx;

        const response = {
          // id: uuid.v4(), get this from the db
          id: 1,
          errors: [],
          isAuthPending: false,
          isAuthenticated: false,
          authURL: null,
        };

        // response.isAuthenticated = isClientTokenSet || Boolean(authToken);
        // response.isAuthPending = Boolean((!isClientTokenSet && !authToken) && requestToken);

        // // // if we've passed an oauthVerifier, then we need to finish up the pending authentication
        // if (oauthVerifier) {
        //   return resolveAccessToken(req, response, requestToken, requestTokenSecret, oauthVerifier);
        // }

        // // otherwise, we need to start the authentication
        // if (!requestToken) {
        //   return resolveRequestToken(req, response);
        // }

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