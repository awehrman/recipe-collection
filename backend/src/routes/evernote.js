import Evernote from 'evernote';
import express from 'express';

const router = express.Router();

const client = new Evernote.Client({
	consumerKey: process.env.API_CONSUMER_KEY,
	consumerSecret: process.env.API_CONSUMER_SECRET,
	sandbox: (process.env.SANDBOX === true),
	china: (process.env.CHINA === true),
});

router.get('/auth', (req, res) => {
	console.log('/auth'.cyan);
	const {
		authToken,
		authTokenSecret,
		requestToken,
		requestTokenSecret,
	} = req.session;
	const { oauthVerifier } = req.query;

	console.log({
		authToken,
		authTokenSecret,
		requestToken,
		requestTokenSecret,
		oauthVerifier,
	});

	// if we already have an auth token in our session, just pass that back
	if (authToken) {
		console.log('Found an existing auth token!'.green);
		return res.json({ evernoteAuthToken: authToken });
	}

	// if we don't have a requestToken, then generate one to kick off the authentication process
	if (!requestToken || !requestTokenSecret) {
		console.log('requesting a token!'.yellow);
		// generate a request token from evernote with a callback to our front-end
		client.getRequestToken(process.env.OAuthCallback, (err, requestToken, requestTokenSecret) => {
			if (err) console.log(err);

			req.session.requestToken = requestToken;
			req.session.requestTokenSecret = requestTokenSecret;

			req.session.save();
			console.log(req.session);
			// ensure that our session saves and pass back the generated evernote authentication url
			return res.send({ tokenLink: client.getAuthorizeUrl(requestToken) });
		});
	} else if (oauthVerifier) {
		// otherwise finish the authentication process and save the auth token
		console.log('getAccessToken'.magenta);
		console.log(requestToken);
		console.log(requestTokenSecret);
		console.log(oauthVerifier);
		// get our actual auth token that we'll use in requests
		client.getAccessToken(requestToken, requestTokenSecret, oauthVerifier, (err, authToken, authTokenSecret) => {
			if (err) console.log(err);

			req.session.authToken = authToken;
			req.session.authTokenSecret = authTokenSecret;
			req.session.requestToken = null;
			req.session.requestTokenSecret = null;

			req.session.save();

			console.log(req.session);
			// return res.redirect('http://localhost:3000/import');
			return res.json({ evernoteAuthToken: authToken });
		});
	}

});

router.get('/clear', (req, res) => {
	console.log('/clear'.cyan);
	req.session.destroy();
	console.log(req.session);
	res.json({ status: 'Session cleared' });
});

module.exports = router;
