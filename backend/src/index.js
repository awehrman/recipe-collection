import 'dotenv/config';
import colors from 'colors';
import cors from 'cors';
import express from 'express';

import createServer from './createServer';

const app = express();
const server = createServer();


const whitelist = [
	'http://localhost:3000',
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

server.applyMiddleware({
	app,
	cors: corsOptions,
	path: '/graphql',
});

app.listen({ port: process.env.PORT || 3001 }, (err) => {
	if (err) throw err;
	console.log(`Apollo Server ready at http://localhost:${ process.env.PORT }${ server.graphqlPath }`);
});
