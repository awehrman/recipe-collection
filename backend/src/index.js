import 'dotenv/config';
import cloudinary from 'cloudinary';
// eslint-disable-next-line
import colors from 'colors';
import cors from 'cors';
import express from 'express';
import cookieSession from 'cookie-session';

import createServer from './createServer';

const app = express();
const server = createServer();

const whitelist = [
	'http://localhost:3000',
	'http://localhost:3001',
	'https://www.evernote.com',
];

const corsOptions = {
	allowedHeaders: [
		'Content-Type',
		'Authorization',
		'Access-Control-Allow-Methods',
		'Access-Control-Request-Headers',
		'Access-Control-Allow-Origin',
	],
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

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use(cors(corsOptions));
app.set('trust proxy', 1);

app.use(cookieSession({
	name: 'session',
	keys: [ process.env.SESSION_KEY ],
	// sameSite: 'lax',
	// secure: false,
	maxAge: 24 * 60 * 60 * 1000,
}));

server.applyMiddleware({
	app,
	cors: false,
	path: '/graphql',
});

app.listen({ port: process.env.PORT || 3001 }, (err) => {
	if (err) throw err;
	console.log(`Apollo Server ready at http://localhost:${ process.env.PORT }${ server.graphqlPath }`);
});
