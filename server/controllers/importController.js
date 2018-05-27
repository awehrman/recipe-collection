const colors = require('colors');
const Evernote = require('evernote');
const fs = require('fs');

const DB_PATH = (process.env.NODE_ENV === 'test') ? 'tests/data' : 'data';

/*====================================
=            Web Requests            =
====================================*/

exports.initializeImport = (req, res, next) => {
	console.log('initializeImport'.cyan);
	res.json({ status: 'Finished Import' });
};

/*=====  End of Web Requests  ======*/
