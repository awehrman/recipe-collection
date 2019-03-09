import withApollo from 'next-with-apollo';
import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag';
import { endpoint } from '../config';

export const typeDefs = gql`
  type Container {
  	currentIngredientID: ID
  	id: ID!
  	ingredients: [ Ingredient ]!
  	label: String!
		isCardEnabled: Boolean!
		isContainerExpanded: Boolean!
  }

  type Mutation {
    setCurrentIngredient(
    	id: ID!
			currentIngredientID: Boolean
			isCardEnabled: Boolean
    ) : Container
  }

  type Mutation {
    setIsContainerExpanded(
    	id: ID!
			isContainerExpanded: Boolean
    ) : Container
  }

  type Query {
    containers: [ Containers ]
  }
`;

function createClient({ headers }) {
	return new ApolloClient({
		uri: process.env.NODE_ENV === 'development' ? endpoint : endpoint,
		request: operation => operation.setContext({
			fetchOptions: { credentials: 'include' },
			headers,
		}),
		clientState: {
			resolvers: {
				// NOTE: i'm getting a console warning about the @client directive being included without resolvers
				// but like... they're right there. this might be realted to
				// https://github.com/apollographql/apollo-client/issues/4520
				// so keep an eye out for upcoming react-apollo updates
				Mutation: {
					setCurrentIngredient(_, variables, { cache, getCacheKey }) {
						console.warn('[withData] setCurrentIngredient');
						console.log(variables);
						const { currentIngredientID, id, isCardEnabled } = variables;
						const fragmentId = getCacheKey({
							id,
							__typename: 'Container',
						});

						const fragment = gql`
							fragment getCurrentStatus on Container {
								currentIngredientID
								id
								isCardEnabled
							}
						`;

						const ctn = cache.readFragment({
							fragment,
							id: fragmentId,
						});

						const data = {
							...ctn,
							currentIngredientID,
							isCardEnabled,
						};

						cache.writeFragment({
							id: fragmentId,
							fragment,
							data,
						});

						return data;
					},

					setIsContainerExpanded(_, variables, { cache, getCacheKey }) {
						console.warn('[withData] setIsContainerExpanded');
						console.log(variables);
						const { isContainerExpanded, id } = variables;
						const fragmentId = getCacheKey({
							id,
							__typename: 'Container',
						});

						const fragment = gql`
							fragment getContainerStatus on Container {
								isContainerExpanded
								id
							}
						`;

						const ctn = cache.readFragment({
							fragment,
							id: fragmentId,
						});

						const data = {
							...ctn,
							isContainerExpanded,
						};

						cache.writeFragment({
							id: fragmentId,
							fragment,
							data,
						});

						return data;
					},
				},
			},
			typeDefs,
		},
	});
}

export default withApollo(createClient);
