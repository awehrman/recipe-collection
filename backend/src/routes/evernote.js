import Evernote from 'evernote';
import express from 'express';

const router = express.Router();

const client = new Evernote.Client({
	consumerKey: process.env.API_CONSUMER_KEY,
	consumerSecret: process.env.API_CONSUMER_SECRET,
	sandbox: process.env.SANDBOX,
	china: process.env.CHINA,
});

router.get('/auth', (req, res) => {
	console.log('/auth'.cyan);
	const { oauthVerifier } = req.query;
	const {
		authToken,
		requestToken,
		requestTokenSecret,
	} = req.session;

	// if we already have an auth token in our session, just pass that back
	if (authToken) {
		console.log('Found an existing auth token!'.green);
		return res.json({ isAuthenticated: true });
	}

	// if we don't have a requestToken, then generate one to kick off the authentication process
	if (!requestToken || !requestTokenSecret) {
		console.log('requesting a token!'.yellow);
		// generate a request token from evernote with a callback to our front-end
		client.getRequestToken(process.env.OAuthCallback, (err, reqToken, reqTokenSecret) => {
			if (err) console.log(err);

			req.session.requestToken = reqToken;
			req.session.requestTokenSecret = reqTokenSecret;

			// req.session.save();
			// ensure that our session saves and pass back the generated evernote authentication url
			return res.send({ authURL: client.getAuthorizeUrl(requestToken) });
		});
	} else if (oauthVerifier) {
		// otherwise finish the authentication process and save the auth token
		console.log('getAccessToken'.magenta);
		// get our actual auth token that we'll use in requests
		client.getAccessToken(requestToken, requestTokenSecret, oauthVerifier, (err, token, tokenSecret) => {
			if (err) console.log(err);

			req.session.authToken = token;
			req.session.authTokenSecret = tokenSecret;
			req.session.requestToken = null;
			req.session.requestTokenSecret = null;

			// req.session.save();

			return res.json({ isAuthenticated: true });
		});
	}

	// TODO return a better status code if we end up down here
	return res.status(200);
});

router.get('/clear', (req, res) => {
	console.log('/clear'.cyan);
	req.session = null;
	res.json({ status: 'Session cleared' });
});

module.exports = router;
