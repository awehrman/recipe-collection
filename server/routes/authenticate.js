const Evernote = require('evernote');
const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
	// setup evernote client
	const client = new Evernote.Client({
    consumerKey: process.env.API_CONSUMER_KEY,
    consumerSecret: process.env.API_CONSUMER_SECRET,
    sandbox: process.env.SANDBOX,
    china: process.env.CHINA
  });

	// check if we have a valid token in our session already
	if (req.session.oauthToken) {
		// and pass us along
		res.redirect('/import');
	} else {
	  // otherwise request a new token
	  client.getRequestToken(process.env.OAuthCallback, function(error, oauthToken, oauthTokenSecret, results) {
	    if (error) {
	      req.session.error = JSON.stringify(error);
	      throw error;
	      res.redirect('/');
	    } else {
	      // store it in our session for next time
	      req.session.oauthToken = oauthToken;
	      req.session.oauthTokenSecret = oauthTokenSecret;

	      // redirect the user to authorize the token on evernote's side
	      res.redirect(client.getAuthorizeUrl(oauthToken));
	    }
	  });
	}
});

// after we've authorized the app at evernote, continue setting up the token
router.get('/callback', (req, res, next) => {
	// setup evernote client
	const client = new Evernote.Client({
    consumerKey: process.env.API_CONSUMER_KEY,
    consumerSecret: process.env.API_CONSUMER_SECRET,
    sandbox: process.env.SANDBOX,
    china: process.env.CHINA
  });

	client.getAccessToken(req.session.oauthToken, req.session.oauthTokenSecret, req.query.oauth_verifier,
  	(error, oauthToken, oauthTokenSecret, results) => {
      if (error) {
        throw error;
        res.redirect('/');
      } else {
        // store the access token in the session
        req.session.oauthToken = oauthToken;
        /*req.session.evernoteClient = new Evernote.Client({
		      token: oauthToken,
		      sandbox: process.env.SANDBOX,
		      china: process.env.CHINA,
		    });*/
       
        try {
          res.redirect('/import');
        } catch (err) {
          throw err;
        }
      }
  });
});

router.get('/clear', (req, res, next) => {
	req.session = null;
	res.json({ status: 'Session cleared' });
});

module.exports = router;
