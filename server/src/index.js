// YOGA setup
require('dotenv').config({ path: '.env' });
const createServer = require('./_createServer');

const server = createServer();

server.start(
	{
		cors: {
			credentials: true,
			origin: process.env.FRONTEND_URL,
		},
	}, (res) => {
		console.log(`Server is now running on port http://localhost:${ res.port }`);
	},
);


/*
	TODO still looking into replacing Yoga with Apollo Server 2
	any yoga-specific files are currently indicated with an _
	this was still getting me some very generic and unhelpful error messages
	its a little unclear what version of graphql i can use with this
	and if there's conflicts elsewhere, i'll probably want to run through this
	on a prototyped project first

require('dotenv').config({ path: '.env' });
const { ApolloServer } = require('apollo-server');

const prisma = require('./prisma');
const schema = require('./schema');

const server = new ApolloServer({
	schema,
	context: ({ req }) => ({
		request: req,
		prisma,
	}),
	playground: process.env.NODE_ENV === 'development',
	debug: process.env.NODE_ENV === 'development',
});

server.listen()
	.then(({ url }) => {
		console.log(`Server is running on ${url}`);
	});
*/
