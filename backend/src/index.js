import 'dotenv/config';
// eslint-disable-next-line
import colors from 'colors';
// import cookieSession from 'cookie-session';
import cors from 'cors';
import express from 'express';

import createServer from './createServer';
import evernoteRoute from './routes/evernote';

const session = require('express-session');

const app = express();
const server = createServer();

const whitelist = [
	'http://localhost:3000',
	'https://www.evernote.com',
];

const corsOptions = {
	credentials: true,
	origin: (origin, callback) => {
		// NOTE: graphQL playground sends 'null' as its origin
		if ((whitelist.indexOf(origin) !== -1) || !origin || (origin === 'null')) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
};

app.use(cors(corsOptions));

// setup routes
app.use('/evernote/', evernoteRoute);

// setup session
app.set('trust proxy', 1);

/*

app.use(cookieSession({
	name: 'session',
	keys: [ 'keyboard cat' ],
}));
*/

app.use(session({
	secret: 'keyboard cat',
	resave: true,
	saveUninitialized: true,
	cookie: {
		secure: false,
		maxAge: 6000000,
	},
}));

server.applyMiddleware({
	app,
	cors: corsOptions,
	path: '/graphql',
});

app.listen({ port: process.env.PORT || 3001 }, (err) => {
	if (err) throw err;
	console.log(`Apollo Server ready at http://localhost:${ process.env.PORT }${ server.graphqlPath }`);
});
