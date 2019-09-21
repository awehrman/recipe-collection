import ApolloClient, { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-boost';
import gql from 'graphql-tag';
import withApollo from 'next-with-apollo';
import { GET_ALL_INGREDIENTS_QUERY, GET_VIEW_INGREDIENTS_QUERY } from './apollo/queries';
import { CREATE_CONTAINERS_MUTATION } from './apollo/mutations';
import { endpoint } from '../config';
/* eslint-disable object-curly-newline */
import {
	generateByCount,
	generateByName,
	generateByProperty,
	generateByRelationship,
} from './generateContainers';
/* eslint-enable object-curly-newline */

const typeDefs = gql`
	type Container {
		count: Int!
		id: String!
		ingredientID: String
		ingredients: [ ContainerIngredient ]!
		isExpanded: Boolean!
		label: String!
	}

	type ContainerIngredient {
		hasParent: Boolean!
		id: ID!
		isValidated: Boolean!
		name: String!
		properties: Properties!
		referenceCount: Int!
	}

	type ContainersResponse {
    containers: [ Container ]
  }

	type Properties {
		id: ID!
		meat: Boolean!
		poultry: Boolean!
		fish: Boolean!
		dairy: Boolean!
		soy: Boolean!
		gluten: Boolean!
	}

	type Query {
		container(id: String!): Container
		containers: [ Container ]!
		ingredient(value: String!): ContainerIngredient
		viewIngredients: [ ContainerIngredient ]!
	}

	type Mutation {
   	createContainers(
	  	group: String!
			ingredients: [ ContainerIngredient ]!
			view: String!
    ) : ContainersResponse
	}

	type Mutation {
   	setContainerIsExpanded(
	  	id: String!
			isExpanded: Boolean!
    ) : null
	}

	type Mutation {
   	setCurrentCard(
	  	id: String!
			ingredientID: String
    ) : null
	}
`;

function createClient({ headers }) {
	const fragmentMatcher = new IntrospectionFragmentMatcher({ introspectionQueryResultData: { __schema: { types: [] } } });
	const cache = new InMemoryCache({ fragmentMatcher });

	return new ApolloClient({
		uri: process.env.NODE_ENV === 'development' ? endpoint : endpoint,
		request: operation => operation.setContext({
			fetchOptions: { credentials: 'include' },
			headers,
		}),
		cache,
		clientState: {
			resolvers: {
				Query: {
					container(_, { id }, { client, getCacheKey }) {
						console.warn(`... [withData](${ id }) container query resolver`);

						const container = client.readFragment({
							id: getCacheKey({
								__typename: 'Container',
								id,
							}),
							fragment: gql`
								fragment getContainer on Container {
									count
									id
									ingredientID
									ingredients {
										id
										isValidated
										name
										properties {
											meat
											poultry
											fish
											dairy
											soy
											gluten
										}
									}
									isExpanded
									label
								}
							`,
						});

						return container;
					},
					async containers(_, { group, ingredientID, view }, { client }) {
						console.warn(`... [withData](${ group }, ${ view }) containers query resolver`);
						let containers = [];
						let ingredients = [];

						// TODO so why am i using query instead of readQuery here? does this HAVE to be async?
						// fetch the ingredients for this view from the cache
						const ingredientsViewData = await client.query({
							// if this isn't in the cache, then go through the local query resolver
							fetchPolicy: 'cache-first',
							query: GET_VIEW_INGREDIENTS_QUERY,
							variables: { view },
						});

						ingredients = ingredientsViewData.data.viewIngredients;

						// group the ingredients into containers
						const { data } = await client.mutate({
							mutation: CREATE_CONTAINERS_MUTATION,
							variables: {
								group,
								ingredientID,
								ingredients,
								view,
							},
						});

						({ containers } = data.createContainers);
						return containers;
					},
					ingredient(_, { value }) {
						console.warn('[withData] ingredient');

						// get all ingredients from the cache
						let { ingredients } = cache.readQuery({ query: GET_ALL_INGREDIENTS_QUERY });

						// pare down the ingredient info to match the ContainerIngredient shape
						ingredients = ingredients.filter((i) => {
							// match on name
							if (i.name === value) return i;
							// match on plural
							if (i.plural === value) return i;
							// match on altName
							if (i.alternateNames.find(n => n.name === value)) return i;
							return null;
						});

						if (ingredients && (ingredients.length === 1)) {
							return {
								__typename: 'ContainerIngredient',
								id: ingredients[0].id,
								name: ingredients[0].name,
							};
						}

						// TODO partial store resets aren't coming until 3.0, we can try to clear out the proxy on a mutation update with:
						// proxy.data.delete('Ingredient');
						return null;
					},
					viewIngredients(_, { view }) {
						console.warn(`... [withData](${ view }) viewIngredients query resolver`);
						// get all ingredients from the cache
						let { ingredients } = cache.readQuery({ query: GET_ALL_INGREDIENTS_QUERY });

						// filter ingredients based on the view
						if (view === 'new') {
							ingredients = ingredients.filter(i => !i.isValidated);
						}
						if (view === 'search') {
							// TODO
						}

						// pare down the ingredient info to match the ContainerIngredient shape
						ingredients = ingredients.map(i => ({
							__typename: 'ContainerIngredient',
							hasParent: Boolean(i.parent),
							id: i.id,
							isValidated: i.isValidated,
							name: i.name,
							properties: { ...i.properties },
							referenceCount: 0,
						}));

						return ingredients;
					},
				},
				Mutation: {
					// eslint-disable-next-line object-curly-newline
					createContainers(_, { group, ingredientID, ingredients, view }) {
						// eslint-disable-next-line max-len
						console.warn(`,,, [withData](${ group }, ingredients: ${ ingredients.length }, ${ view }) createContainers mutation resolver`);
						let containers = [];

						switch (group) {
						case 'count':
							containers = generateByCount(ingredientID, ingredients);
							break;
						case 'property':
							containers = generateByProperty(ingredientID, ingredients);
							break;
						case 'relationship':
							containers = generateByRelationship(ingredientID, ingredients);
							break;
						default:
							containers = generateByName(ingredientID, ingredients, view);
							break;
						}

						return {
							__typename: 'ContainersResponse',
							containers,
						};
					},
					// eslint-disable-next-line object-curly-newline
					setContainerIsExpanded(_, { id, isExpanded }, { client, getCacheKey }) {
						// eslint-disable-next-line max-len
						console.warn(`,,, [withData](${ id }, ${ isExpanded }) setContainerIsExpanded mutation resolver`);

						client.writeFragment({
							id: getCacheKey({
								__typename: 'Container',
								id,
							}),
							fragment: gql`
								fragment setIsExpanded on Container {
									isExpanded
								}
							`,
							data: {
								__typename: 'Container',
								isExpanded,
							},
						});

						return null;
					},
					// eslint-disable-next-line object-curly-newline
					setCurrentCard(_, { id, ingredientID }, { client, getCacheKey }) {
						// eslint-disable-next-line max-len
						console.warn(`,,, [withData](${ id }, ${ ingredientID }) setCurrentCard mutation resolver`);

						client.writeFragment({
							id: getCacheKey({
								__typename: 'Container',
								id,
							}),
							fragment: gql`
								fragment setCurrentCard on Container {
									ingredientID
								}
							`,
							data: {
								__typename: 'Container',
								ingredientID,
							},
						});

						return null;
					},
				},
			},
			typeDefs,
		},
	});
}

export default withApollo(createClient);
