import Evernote from 'evernote';

// TODO move these into their own util file
const client = new Evernote.Client({
	consumerKey: process.env.API_CONSUMER_KEY,
	consumerSecret: process.env.API_CONSUMER_SECRET,
	sandbox: process.env.SANDBOX,
	china: process.env.CHINA,
});

const resolveRequestToken = (req, response) => new Promise((resolve, reject) => {
	client.getRequestToken(process.env.OAuthCallback, (err, reqToken, reqTokenSecret) => {
		if (err) reject(err);

		req.session.requestToken = reqToken;
		req.session.requestTokenSecret = reqTokenSecret;

		response.isAuthenticatedPending = true;
		response.authURL = client.getAuthorizeUrl(reqToken);

		resolve(response);
	});
});

const resolveAccessToken = (req, response, oauthVerifier) => new Promise((resolve, reject) => {
	client.getAccessToken(req.session.requestToken, req.session.requestTokenSecret, oauthVerifier, (err, token, tokenSecret) => {
		if (err) reject(err);

		req.session.authToken = token;
		req.session.authTokenSecret = tokenSecret;
		req.session.requestToken = null;
		req.session.requestTokenSecret = null;

		response.isAuthenticated = true;
		response.isAuthenticatedPending = false;

		resolve(response);
	});
});

export default {
	Query: {
		isEvernoteAuthenticated: async (parent, args, ctx) => {
			console.log('isEvernoteAuthenticated'.cyan);
			const { req } = ctx;
			const {
				authToken,
				requestToken,
			} = req.session;
			console.log({ ...req.session });
			// TODO i feel like my session isn't persisting between these calls
			const response = {
				__typename: 'AuthenticationResponse',
				errors: [],
				isAuthenticationPending: false,
				isAuthenticated: false,
			};

			// if we already have a token in our session, just return that
			if (authToken) {
				response.isAuthenticated = true;
			}

			if (requestToken && !authToken) {
				response.isAuthenticationPending = true;
			}

			console.log({ response });
			return response;
		},
	},
	Mutation: {
		authenticate: async (parent, args, ctx) => {
			console.log('authenticate'.cyan);
			const { oauthVerifier } = args;
			const { req } = ctx;
			const {
				authToken,
				requestToken,
				requestTokenSecret,
			} = req.session;

			const response = {
				__typename: 'AuthenticationResponse',
				errors: [],
				isAuthenticationPending: req.session.isAuthenticatedPending,
				isAuthenticated: req.session.isAuthenticated,
				authURL: null,
			};

			// if we already have a token in our session, just return that
			if (authToken) {
				response.isAuthenticated = true;
			} else if (!requestToken || !requestTokenSecret) {
				await resolveRequestToken(req, response);
			} else if (oauthVerifier) {
				// otherwise finish the authentication process and save the auth token
				await resolveAccessToken(req, response, oauthVerifier);
			} else {
				// TODO clear session?
			}

			console.log({ response });
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
