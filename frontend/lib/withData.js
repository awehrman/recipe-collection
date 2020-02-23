import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import withApollo from 'next-with-apollo';
import { GRAPHQL_ENDPOINT } from '../config';
import resolvers from './apollo/resolvers';
import typeDefs from './apollo/typeDefs';

const createClient = ({ /* ctx, headers */ initialState }) => new ApolloClient({
	cache: new InMemoryCache().restore(initialState || {}),
	link: new HttpLink({ uri: GRAPHQL_ENDPOINT }),
	resolvers,
	typeDefs,
});

export default withApollo(createClient);
