import { ApolloServer } from 'apollo-server-express';
import { importSchema } from 'graphql-import';
import path from 'path';
import { prisma } from './generated/prisma-client';

import resolvers from './resolvers';

const typeDefs = importSchema(path.resolve('src/schema/schema.graphql'));

export default () => new ApolloServer({
	typeDefs,
	resolvers,
	context: async ({ req, res }) => ({
		req,
		res,
		prisma,
	}),
	tracing: true,
	introspection: true,
	playground: {
		settings: {
			'editor.theme': 'light',
			'request.credentials': 'include',
		},
	},
});
