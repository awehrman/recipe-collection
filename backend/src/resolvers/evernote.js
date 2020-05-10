import Evernote from 'evernote';

// TODO move these into their own util file
const client = new Evernote.Client({
	consumerKey: process.env.API_CONSUMER_KEY,
	consumerSecret: process.env.API_CONSUMER_SECRET,
	sandbox: process.env.SANDBOX,
	china: process.env.CHINA,
});

const resolveRequestToken = (req, response) => new Promise((resolve, reject) => {
	console.log('resolveRequestToken');
	client.getRequestToken(process.env.OAuthCallback, (err, reqToken, reqTokenSecret) => {
		if (err) reject(err);

		req.session.requestToken = reqToken;
		req.session.requestTokenSecret = reqTokenSecret;

		response.isAuthenticationPending = true;
		response.isAuthenticated = false;
		response.authURL = client.getAuthorizeUrl(reqToken);

		console.log({ response });
		resolve(response);
	});
});

const resolveAccessToken = (req, response, oauthVerifier) => new Promise((resolve, reject) => {
	console.log('resolveAccessToken');
	client.getAccessToken(req.session.requestToken, req.session.requestTokenSecret, oauthVerifier, (err, token, tokenSecret) => {
		if (err) reject(err);

		req.session.authToken = token;
		req.session.authTokenSecret = tokenSecret;
		req.session.requestToken = null;
		req.session.requestTokenSecret = null;

		response.isAuthenticated = true;
		response.isAuthenticationPending = false;

		console.log({ response });
		resolve(response);
	});
});

export default {
	Query: {
		isEvernoteAuthenticated: async (parent, args, ctx) => {
			console.log('isEvernoteAuthenticated'.cyan);

			const response = {
				__typename: 'AuthenticationResponse',
				errors: [],
				isAuthenticationPending: false,
				isAuthenticated: false,
			};
			const { req } = ctx;
			console.log(req.session);
			const {
				authToken,
				requestToken,
			} = req.session;
			// TODO i feel like my session isn't persisting between these calls
			// WEHRMAN you REALLLLLY need to figure out this SSR issue
			// take another look and how this shit is wired up cause the server is going thru the resolvers twice!
			console.log({
				authToken,
				requestToken,
			});
			// if we already have a token in our session, just return that
			if (authToken) {
				response.isAuthenticated = true;
			}

			if (requestToken && !authToken) {
				response.isAuthenticationPending = true;
			}

			// console.log({ response });
			return response;
		},
	},
	Mutation: {
		authenticate: async (parent, args, ctx) => {
			console.log('authenticate'.cyan);
			const { oauthVerifier } = args;
			const { req } = ctx;
			console.log(req.session);
			const {
				authToken,
				requestToken,
				requestTokenSecret,
			} = req.session;
			console.log({
				authToken,
				requestToken,
				requestTokenSecret,
			});

			const response = {
				__typename: 'AuthenticationResponse',
				errors: [],
				isAuthenticationPending: req.session.isAuthenticationPending,
				isAuthenticated: req.session.isAuthenticated,
				authURL: null,
			};

			// if we already have a token in our session, just return that
			if (authToken) {
				console.log('we have an authToken already!');
				response.isAuthenticated = true;
			} else if (!requestToken || !requestTokenSecret) {
				return resolveRequestToken(req, response);
			} else if (oauthVerifier) {
				// otherwise finish the authentication process and save the auth token
				return resolveAccessToken(req, response, oauthVerifier);
			} else {
				console.log('fuck i should be doing something here...');
				// TODO clear session?
			}

			console.log('returning DEFAULT response: ', { response });
			return response;
		},
		clearAuthentication: async (parent, args, ctx) => {
			console.log('clearAuthentication'.cyan);
			const response = {
				__typename: 'AuthenticationResponse',
				errors: [],
				isAuthenticated: false,
			};

			const { req } = ctx;
			req.session = null;

			return response;
		},
	},
};
