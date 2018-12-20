const express = require('express');
const router = express.Router();

const importController = require('../controllers/importController');

router.get('/', (req, res, next) => {
	// if we don't have a valid token, make the user authorize the app
	if (!req.session.oauthToken) {
		res.redirect('/authenticate');
	} else {
		// start import process
		importController.renderPage(req, res, next);
	}
});

router.get('/download', (req, res, next) => {
	// if we don't have a valid token, make the user authorize the app
	if (!req.session.oauthToken) {
		res.redirect('/authenticate');
	} else {
		// start import process
		importController.stageNotes(req, res, next);
	}
});

router.get('/convert', (req, res, next) => {
	// if we don't have a valid token, make the user authorize the app
	if (!req.session.oauthToken) {
		res.redirect('/authenticate');
	} else {
		// start import process
		importController.convertNotes(req, res, next);
	}
});

module.exports = router;
