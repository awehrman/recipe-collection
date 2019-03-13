import withApollo from 'next-with-apollo';
import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag';
import { endpoint } from '../config';

// NOTE: with @client directives set on our GET_ALL_CONTAINERS_QUERY
// initial page load sends the server response, but uses the local cached @client values

// we need to invalidate the cache at certain points during our GET_ALL_CONTAINERS_QUERY
// mutation so that we keep the cache completely up to date
// look into using the update() call on that mutation

// see related article
// https://medium.com/@martinseanhunt/how-to-invalidate-cached-data-in-apollo-and-handle-updating-paginated-queries-379e4b9e4698

export const typeDefs = gql`
  type Container {
  	currentIngredientID: ID
  	id: ID!
  	ingredients: [ Ingredient ]!
  	label: String!
		isCardEnabled: Boolean!
		isContainerExpanded: Boolean!
  }

  type Containers {
  	containers: [Container]!
  }

  type Mutation {
    setCurrentCard(
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
			/* NOTE: i can get this working in conjunction with using @client directives in my getContainers
				 query but i can't seem to figure out how to override these defaults with my initial server response
				 so i've removed the @client directives and it seems to be working properly now but be careful about
				 how often we're hitting the server for new data
	 
			defaults: {
				currentIngredientID: null,
				isCardEnabled: false,
				isContainerExpanded: true,
			},
			*/
			resolvers: {
				// NOTE: i'm getting a console warning about the @client directive being included without resolvers
				// but like... they're right there. this might be realted to
				// https://github.com/apollographql/apollo-client/issues/4520
				// so keep an eye out for upcoming react-apollo updates
				Mutation: {
					setCurrentCard(_, variables, { cache, getCacheKey }) {
						console.warn('[withData] setCurrentCard');
						const { currentIngredientID, id, isCardEnabled } = variables;
						console.log({ currentIngredientID, id, isCardEnabled });

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

						console.warn('wrote cache:');
						console.log(data);

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
