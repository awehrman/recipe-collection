import 'dotenv/config';
// eslint-disable-next-line
import colors from 'colors';
import cors from 'cors';
import express from 'express';
import cookieSession from 'cookie-session';

import evernoteRoute from './routes/evernote';
import createServer from './createServer';

// const session = require('express-session');

const app = express();
const server = createServer();

const whitelist = [
	'http://localhost:3000',
	'http://localhost:3001',
	'https://www.evernote.com',
];

const corsOptions = {
	allowedHeaders: ["Content-Type", "Authorization", "Access-Control-Allow-Methods", "Access-Control-Request-Headers", "Access-Control-Allow-Origin"],
	credentials: true,
	enablePreflight: true,
	origin: (origin, callback) => {
		// NOTE: graphQL playground sends 'null' as its origin
		if ((whitelist.indexOf(origin) !== -1) || !origin || (origin === 'null') || (origin === undefined)) {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
};

app.use(cors(corsOptions));

/*
	app.use(session({
		secret: 'keyboard cat',
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 60000,
			sameSite: 'lax',
			secure: false,
		},
	}));
*/

app.use(cookieSession({
	name: 'session',
	keys: [ process.env.SESSION_KEY ],
	sameSite: 'lax',
	secure: false,
	maxAge: 24 * 60 * 60 * 1000,
}));

app.use('/evernote', evernoteRoute);
app.set('trust proxy', 1);

server.applyMiddleware({
	app,
	cors: false,
	path: '/graphql',
});

app.listen({ port: process.env.PORT || 3001 }, (err) => {
	if (err) throw err;
	console.log(`Apollo Server ready at http://localhost:${ process.env.PORT }${ server.graphqlPath }`);
});
