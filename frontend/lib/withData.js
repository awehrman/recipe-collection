import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag';
import withApollo from 'next-with-apollo';

import { GET_ALL_WARNINGS_QUERY } from '../components/ingredients/Form';
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

  type Warning {
		fieldName: String!
  	preventSave: Boolean!
  	message: String!
  	value: String!
  }

  type Warnings {
  	id: ID
  	warnings: [ Warning ]
  }

  type Mutation {
    addWarning(
    	fieldName: String!
	  	preventSave: Boolean!
	  	message: String!
	  	value: String!
    ) : Boolean
  }

	type Mutation {
    resetWarnings(
    	reset: Bool
    ) : Boolean
  }

  type Query {
    containers: [ Containers ]
    warnings: [ Warning! ]
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
			defaults: { warnings: null },
			resolvers: {
				Mutation: {
					addWarning(_, variables, { cache, getCacheKey }) {
						const {
							fieldName,
							preventSave,
							message,
							value,
						} = variables;

						const warning = {
							__typename: 'Warning',
							fieldName,
							preventSave,
							message,
							value,
						};

						let { warnings } = cache.readQuery({ query: GET_ALL_WARNINGS_QUERY });

						if (warnings) {
							warnings.push(warning);
						} else {
							warnings = [ warning ];
						}

						const data = {
							__typename: 'Warnings',
							warnings,
						};

						const fragmentId = getCacheKey({
							id: -1,
							__typename: 'Warning',
						});

						cache.writeData({
							fragmentId,
							data,
						});

						return data;
					},

					resetWarnings(_, variables, { cache, getCacheKey }) {
						const data = {
							__typename: 'Warnings',
							warnings: null,
						};

						const fragmentId = getCacheKey({
							id: -1,
							__typename: 'Warning',
						});

						cache.writeData({
							fragmentId,
							data,
						});

						return data;
					},

					setCurrentCard(_, variables, { cache, getCacheKey }) {
						console.warn('[withData] setCurrentCard');
						const { currentIngredientID, id, isCardEnabled } = variables;
						// console.log({ currentIngredientID, id, isCardEnabled });

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
