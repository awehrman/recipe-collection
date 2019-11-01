import Evernote from 'evernote';
import express from 'express';

const router = express.Router();

const client = new Evernote.Client({
	consumerKey: process.env.API_CONSUMER_KEY,
	consumerSecret: process.env.API_CONSUMER_SECRET,
	sandbox: (process.env.SANDBOX === true),
	china: (process.env.CHINA === true),
});

router.get('/', (req, res) => {
	console.log('/evernote/'.yellow);
	// TODO check if we already have a token in our session, if not re-request one

	/*
	if (req.session && req.session.oauthToken && req.session.oauthTokenSecret) {
		res.send({ evernoteAuthToken: req.session.oauthToken });
	}
	*/

	//req.session.reload(() => {
		// if (!req.session.oauthToken || !req.session.oauthTokenSecret) {
			console.log('getRequestToken'.yellow);
			client.getRequestToken(process.env.OAuthCallback, (error, oauthToken, oauthTokenSecret) => {
				if (error) {
					console.log(`${ JSON.stringify(error) }`.red);
					res.sendStatus(500);
				}

				req.session.oauthToken = oauthToken;
				req.session.oauthTokenSecret = oauthTokenSecret;

				req.session.save((err) => {
					if (err) console.log(err);
					// es.send({ tokenLink: client.getAuthorizeUrl(oauthToken) });
					res.redirect(client.getAuthorizeUrl(oauthToken));
				});
			});
			/*
		} else {
			console.log('getAccessToken'.yellow);
			const { oauthVerifier } = req.query;

			// req.query.oauth_verifier
			if (req.session.oauthToken && req.session.oauthTokenSecret && oauthVerifier) {
				client.getAccessToken(req.session.oauthToken, req.session.oauthTokenSecret, oauthVerifier, (error, oauthToken, oauthTokenSecret) => {
					if (error) {
						console.log(`${ JSON.stringify(error) }`.red);
						return res.sendStatus(500);
					}
					// store the access token in the session
					req.session.oauthToken = oauthToken;
					req.session.oauthTokenSecret = oauthTokenSecret;

					req.session.save((err) => {
						if (err) console.log(err);
					});

					console.log({ oauthToken });
					res.send({ evernoteAuthToken: oauthToken });
				});
			}
		}
		*/
	//});
});

router.get('/callback', (req, res) => {
	console.log('/evernote/callback'.yellow);
	console.log('getAccessToken'.yellow);
	const { oauthVerifier } = req.query;

	console.log(req.session);
	// req.query.oauth_verifier
	if (req.session.oauthToken && req.session.oauthTokenSecret && req.query.oauth_verifier) {
		client.getAccessToken(req.session.oauthToken, req.session.oauthTokenSecret, req.query.oauth_verifier, (error, oauthToken, oauthTokenSecret) => {
			if (error) {
				console.log(`${ JSON.stringify(error) }`.red);
				return res.sendStatus(500);
			}
			// store the access token in the session
			req.session.oauthToken = oauthToken;
			req.session.oauthTokenSecret = oauthTokenSecret;

			req.session.save((err) => {
				if (err) console.log(err);
			});

			console.log({ oauthToken });
			res.redirect('http://localhost:3000/import');
			// res.send({ evernoteAuthToken: oauthToken });
		});
	}
});

router.get('/clear', (req, res) => {
	// req.session = {};
	req.session.destroy();
	res.json({ status: 'Session cleared' });
});

module.exports = router;
