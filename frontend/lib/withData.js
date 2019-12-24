import ApolloClient, { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-boost';
import withApollo from 'next-with-apollo';
import typeDefs from './apollo/typeDefs';
import { endpoint } from '../config';
/* eslint-disable object-curly-newline */
import {
	generateByCount,
	generateByName,
	generateByProperty,
	generateByRelationship,
} from './generateContainers';
import {
	GET_ALL_CATEGORIES_QUERY,
	GET_ALL_CONTAINERS_QUERY,
	GET_ALL_INGREDIENTS_QUERY,
	GET_ALL_TAGS_QUERY,
} from './apollo/queries';
import {
	getContainer,
	setCurrentCard,
	setIsExpanded,
} from './apollo/fragments';
/* eslint-enable object-curly-newline */

function createClient({ headers }) {
	const fragmentMatcher = new IntrospectionFragmentMatcher({ introspectionQueryResultData: { __schema: { types: [] } } });
	const cache = new InMemoryCache({ fragmentMatcher });

	return new ApolloClient({
		uri: process.env.NODE_ENV === 'development' ? endpoint : endpoint,
		request: (operation) => operation.setContext({
			fetchOptions: { credentials: 'include' },
			headers,
		}),
		cache,
		credentials: 'same-origin',
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
							fragment: getContainer,
						});

						console.log({ container });
						return container;
					},
					containers(_, { group, view }, { client }) {
						console.warn(`!!! [withData](${ group }, ${ view }) containers query resolver`);
						// read the containers out of the query
						const { containers } = client.readQuery({
							query: GET_ALL_CONTAINERS_QUERY,
							variables: {
								group,
								view,
							},
						});
						console.log({ containers });
						return containers;
					},
					ingredient(_, { value }) {
						// console.warn(`... [withData] ingredient ${ value }`);
						// get all ingredients from the cache
						let { ingredients } = cache.readQuery({ query: GET_ALL_INGREDIENTS_QUERY });
						if (!value || value === '') return null;
						const adjusted = value.toLowerCase();

						// pare down the ingredient info to match the ContainerIngredient shape
						ingredients = ingredients.filter((i) => {
							// match on name
							if (i.name === adjusted) return i;
							// match on plural
							if (i.plural === adjusted) return i;
							// match on altName
							if (i.alternateNames.find((n) => n.name === adjusted)) return i;
							return null;
						});


						if (ingredients && (ingredients.length === 1)) {
							return {
								__typename: 'ContainerIngredient',
								id: ingredients[0].id,
								name: ingredients[0].name,
								plural: ingredients[0].plural,
								properties: { ...ingredients[0].properties },
								isValidated: ingredients[0].isValidated,
							};
						}

						// TODO partial store resets aren't coming until 3.0, we can try to clear out the proxy on a mutation update with:
						// proxy.data.delete('Ingredient');
						return null;
					},
					suggestions(_, { type, value }) {
						// console.warn(`... [withData](${ type }, ${ value }) suggestions query resolver`);
						let suggestions = [];

						// determine the lookup query based on the type
						let query = GET_ALL_INGREDIENTS_QUERY;
						if (type === 'tags') {
							query = GET_ALL_TAGS_QUERY;
						} else if (type === 'categories') {
							query = GET_ALL_CATEGORIES_QUERY;
						}

						if (value && value.length > 0) {
							// get all ingredients from the cache
							const data = cache.readQuery({ query });
							suggestions = data[type].filter((i) => (
								// return partial matches
								(i.name.indexOf(value) > -1)
								// ... as long as they're not an exact match on our input
								&& (i.name !== value)
							));

							suggestions.sort((a, b) => a.name.localeCompare(b.name));
							suggestions = suggestions.slice(0, 5);

							suggestions = suggestions.map((i) => ({
								__typename: 'Suggestion',
								id: i.id,
								name: i.name,
							}));
						}

						return suggestions;
					},
				},
				Mutation: {
					// eslint-disable-next-line object-curly-newline
					createContainers(_, { group, view }, { client }) {
						// eslint-disable-next-line max-len
						console.warn(`,,, [withData](${ group }, ${ view }) createContainers mutation resolver`);
						let containers = [];
						// query ingredients
						const { ingredients } = client.readQuery({ query: GET_ALL_INGREDIENTS_QUERY });

						// TODO handle 'search' view
						// filter by view
						const viewIngredients = (view === 'new')
							? ingredients.filter((ing) => !ing.isValidated)
							: [ ...ingredients ];

						console.log({ viewIngredients });

						// generate containers based on grouping
						switch (group) {
						case 'count':
							containers = generateByCount(viewIngredients);
							break;
						case 'property':
							containers = generateByProperty(viewIngredients);
							break;
						case 'relationship':
							containers = generateByRelationship(viewIngredients);
							break;
						default:
							containers = generateByName(viewIngredients, view);
							break;
						}

						const data = {
							__typename: 'ContainersResponse',
							errors: [], // TODO handle errors
							containers,
						};
						console.log({ ...data });

						// save to cache
						client.writeQuery({
							data,
							query: GET_ALL_CONTAINERS_QUERY,
							variables: {
								group,
								view,
							},
						});

						return data;
					},
					// eslint-disable-next-line object-curly-newline
					/*
					removeIngredientFromView(_, { id, ingredientID, view }, { client, getCacheKey }) {
						// eslint-disable-next-line max-len
						console.warn(`,,, [withData](${ id }, ${ ingredientID }, ${ view }) removeIngredientFromView mutation resolver`);

						const { data: { viewIngredients }} = client.readQuery({
							// if this isn't in the cache, then go through the local query resolver
							query: GET_VIEW_INGREDIENTS_QUERY,
							variables: { view },
						});

						client.writeFragment({
							id: getCacheKey({
								__typename: 'Container',
								id,
							}),
							fragment: setCurrentCard,
							data: {
								__typename: 'Container',
								ingredientID,
							},
						});

						return null;
					},
					*/
					// eslint-disable-next-line object-curly-newline
					setContainerIsExpanded(_, { id, isExpanded }, { client, getCacheKey }) {
						// eslint-disable-next-line max-len
						// console.warn(`,,, [withData](${ id }, ${ isExpanded }) setContainerIsExpanded mutation resolver`);

						client.writeFragment({
							id: getCacheKey({
								__typename: 'Container',
								id,
							}),
							fragment: setIsExpanded,
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
						// console.warn(`,,, [withData](${ id }, ${ ingredientID }) setCurrentCard mutation resolver`);

						client.writeFragment({
							id: getCacheKey({
								__typename: 'Container',
								id,
							}),
							fragment: setCurrentCard,
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
