import 'dotenv/config';
// eslint-disable-next-line
import colors from 'colors';
import cors from 'cors';
import express from 'express';
// import cookieSession from 'cookie-session';

import evernoteRoute from './routes/evernote';
import createServer from './createServer';

const session = require('express-session');

const app = express();
const server = createServer();

const whitelist = [
	undefined,
	'null',
	null,
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
// app.options('*', cors(corsOptions));
/*
app.options('/evernote/callback', (req, res) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, // X-Requested-With');
	res.send(200);
});

app.all('*', (req, res, next) => {
  let origin = req.get('origin');
  res.header('Access-Control-Allow-Origin', origin);
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); // update to match // the domain you will make the request from
	// res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
	next();
});
*/

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

/*
app.use(cookieSession({
	name: 'session',
	keys: [ 'keyboard cat' ],
	path: '/evernote',
	sameSite: 'lax',
	secure: false,
	maxAge: 24 * 60 * 60 * 1000,
}));
*/

/*
app.use((req, res, next) => {
	console.log('!!!'.red);
	console.log(req.url);
	res.header('Access-Control-Allow-Origin', process.env.ORIGIN || '*');
	next();
});

app.use(
	'/evernote/callback',
	proxy({
		target: 'http://localhost:3001',
		changeOrigin: true,
	}),
);

	// intercept OPTIONS method
	if (oneOf && req.method === 'OPTIONS') {
		console.log('OPTIONS');
		res.sendStatus(200);
	} else {
		next();
	}
});
*/

/*
app.get('/evernote/callback/', (req, res) => {
	const options = {
		headers: { 'Access-Control-Allow-Origin': 'http://localhost:3001' },
	};
	request(options, 'http://localhost:3000').pipe(res);
});
*/

app.use('/evernote', evernoteRoute);

// setup session
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
