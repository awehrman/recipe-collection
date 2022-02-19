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
	console.log({ client });
	client.getRequestToken(process.env.OAuthCallback, (err, requestToken, requestTokenSecret) => {
		console.log({ err });
		if (err) reject(err);

		response.isAuthenticationPending = true;
		response.isAuthenticated = false;
		response.authURL = client.getAuthorizeUrl(requestToken);

		req.session.requestToken = requestToken;
		req.session.requestTokenSecret = requestTokenSecret;

		resolve(response);
	});
});

const resolveAccessToken = (req, response, requestToken, requestTokenSecret, oauthVerifier) => new Promise((resolve, reject) => {
	console.log('resolveAccessToken');
	client.getAccessToken(requestToken, requestTokenSecret, oauthVerifier, (err, authToken, authTokenSecret) => {
		console.log({ err });
		if (err) reject(err);

		response.isAuthenticated = true;
		response.isAuthenticationPending = false;

		req.session.authToken = authToken;
		req.session.authTokenSecret = authTokenSecret;
		req.session.requestToken = null;
		req.session.requestTokenSecret = null;

		resolve(response);
	});
});

export default {
	Query: {
		isEvernoteAuthenticated: async (_, args, ctx) => {
			console.log('isEvernoteAuthenticated'.cyan);
			const { req } = ctx;
			const { authToken, requestToken } = req.session;
			const isClientTokenSet = Boolean(client.token);
			// eslint-disable-next-line object-curly-newline
			console.log({ authToken, requestToken, clientToken: client.token });

			// TODO can we move these default responses into another file?
			const response = {
				__typename: 'AuthenticationResponse',
				errors: [],
				isAuthenticationPending: false,
				isAuthenticated: false,
			};

			// if we have a token in our evernote client then we can side-step this whole thing
			// which sure is convenient since my cookie session isn't persisting on refresh
			response.isAuthenticated = isClientTokenSet || Boolean(authToken);
			response.isAuthenticationPending = Boolean((!isClientTokenSet && !authToken) && requestToken);

			console.log({ ...response });
			return response;
		},
	},
	Mutation: {
		authenticate: async (_, args, ctx) => {
			console.log('authenticate'.cyan);
			const { oauthVerifier } = args;
			const { req } = ctx;
			const { authToken, requestToken, requestTokenSecret } = req.session || {};
			const isClientTokenSet = Boolean(client.token);

			const response = {
				__typename: 'AuthenticationResponse',
				errors: [],
				isAuthenticationPending: false,
				isAuthenticated: false,
				authURL: null,
			};

			response.isAuthenticated = isClientTokenSet || Boolean(authToken);
			response.isAuthenticationPending = Boolean((!isClientTokenSet && !authToken) && requestToken);

			// if we've passed an oauthVerifier, then we need to finish up the pending authentication
			if (oauthVerifier) {
				return resolveAccessToken(req, response, requestToken, requestTokenSecret, oauthVerifier);
			}

			// otherwise, we need to start the authentication
			if (!requestToken) {
				return resolveRequestToken(req, response);
			}

			return response;
		},
		clearAuthentication: async (parent, args, ctx) => {
			console.log('clearAuthentication'.cyan);
			const response = {
				__typename: 'AuthenticationResponse',
				errors: [],
				isAuthenticated: false,
				isAuthenticationPending: false,
			};

			const { req } = ctx;
			req.session = null;

			// TODO do i need to force update my evernote client here too?

			return response;
		},
	},
};
