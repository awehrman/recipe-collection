import { ApolloClient } from '@apollo/client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import fetch from 'isomorphic-unfetch';
import resolvers from './apollo/resolvers';
import { GRAPHQL_ENDPOINT } from '../config';

export default function createApolloClient(initialState, ctx) {
	// The `ctx` (NextPageContext) will only be present on the server.
	// use it to extract auth headers (ctx.req) or similar.
	return new ApolloClient({
		ssrMode: Boolean(ctx),
		link: new HttpLink({
			uri: GRAPHQL_ENDPOINT, // Server URL (must be absolute)
			// idk moving this to include suddenly fixed my cookie session issues
			credentials: 'include', // Additional fetch() options like `credentials` or `headers`
			fetch,
		}),
		cache: new InMemoryCache().restore(initialState),
		resolvers,
	});
}
