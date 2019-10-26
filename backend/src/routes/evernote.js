import Evernote from 'evernote';
import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
	console.log('/evernote/'.green);
	// setup evernote client
	const client = new Evernote.Client({
		consumerKey: process.env.API_CONSUMER_KEY,
		consumerSecret: process.env.API_CONSUMER_SECRET,
		sandbox: (process.env.SANDBOX === true),
		china: (process.env.CHINA === true),
	});

	console.log(req.session);
	// check if we have a valid token in our session already
	if (req.session && req.session.oauthToken) {
		console.log('A');
		client.getAccessToken(req.session.oauthToken, req.session.oauthTokenSecret, req.query.oauth_verifier,
			(error, oauthToken, oauthTokenSecret) => {
				if (error) {
					req.session.accessTokenError = JSON.stringify(error);
					req.session.save((err) => {
						console.log(err);
						res.redirect('http://localhost:3000/');
					});
				}
				// store the access token in the session
				req.session = {
					oauthToken,
					oauthTokenSecret,
				};
				console.log(req.session);
				req.session.save((err) => {
					console.log(err);
					res.redirect('http://localhost:3000/import');
				});
			});
	} else {
		console.log('B');
		// otherwise request a new token
		client.getRequestToken(process.env.OAuthCallback, (error, oauthToken, oauthTokenSecret) => {
			if (error) {
				req.session.requestTokenError = JSON.stringify(error);
				console.log(error);
				req.session.save((err) => {
					console.log(err);
					res.redirect('http://localhost:3000/');
				});
			}

			// store it in our session for next time
			req.session = {
				oauthToken,
				oauthTokenSecret,
			};

			console.log(req.session);
			// redirect the user to authorize the token on evernote's side
			res.redirect(client.getAuthorizeUrl(oauthToken));
		});
	}
});


// after we've authorized the app at evernote, continue setting up the token
router.get('/callback', (req, res) => {
	// setup evernote client
	const client = new Evernote.Client({
		consumerKey: process.env.API_CONSUMER_KEY,
		consumerSecret: process.env.API_CONSUMER_SECRET,
		sandbox: (process.env.SANDBOX === true),
		china: (process.env.CHINA === true),
	});

	console.log(req.session);

	client.getAccessToken(req.session.oauthToken, req.session.oauthTokenSecret, req.query.oauth_verifier,
		(error, oauthToken, oauthTokenSecret) => {
			if (error) {
				req.session.accessTokenError = JSON.stringify(error);
				req.session.save((err) => {
					console.log(err);
					res.redirect('http://localhost:3000/');
				});
			}
			// store the access token in the session
			req.session = {
				oauthToken,
				oauthTokenSecret,
			};
			req.session.save((err) => {
				console.log(err);
				res.redirect('http://localhost:3000/import');
			});
		});
});

router.get('/clear', (req, res) => {
	console.log(req.session);
	console.log('=>'.red);
	// req.session.destroy();
	req.session = {};
	console.log(req.session);
	res.json({ status: 'Session cleared' });
});

module.exports = router;
