import ApolloClient, { InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-boost';
import gql from 'graphql-tag';
import withApollo from 'next-with-apollo';
import { CREATE_CONTAINERS_MUTATION } from './apollo/mutations';
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
	GET_ALL_INGREDIENTS_QUERY,
	GET_ALL_TAGS_QUERY,
	GET_VIEW_INGREDIENTS_QUERY,
} from './apollo/queries';
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
						// console.warn(`... [withData](${ id }) container query resolver`);

						// TODO move fragments into their own file
						const container = client.readFragment({
							id: getCacheKey({
								__typename: 'Container',
								id,
							}),
							fragment: gql`
								fragment getContainer on Container {
									id
									ingredientID
									ingredients {
										hasParent
										id
										isValidated
										name
										plural
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
									referenceCount
								}
							`,
						});

						return container;
					},
					async containers(_, { group, ingredientID, view }, { client }) {
						// console.warn(`... [withData](${ group }, ${ view }) containers query resolver`);
						let containers = [];
						let ingredients = [];

						// TODO so why am i using query instead of readQuery here? does this HAVE to be async?
						// fetch the ingredients for this view from the cache
						const ingredientsViewData = await client.query({
							// if this isn't in the cache, then go through the local query resolver
							fetchPolicy: 'network-only', // 'cache-first',
							query: GET_VIEW_INGREDIENTS_QUERY,
							variables: { view },
						});

						ingredients = ingredientsViewData.data.viewIngredients;
						// group the ingredients into containers
						let data = { createContainers: { containers: [] } };
						// TODO this should attempt to read the container from the cache first
						// TODO or idk properly reset parts of the cache, there's definitely some race conditions here
						// it might be worth waiting till the next apollo bump tho
						try {
							({ data } = await client.mutate({
								mutation: CREATE_CONTAINERS_MUTATION,
								variables: {
									group,
									ingredientID,
									ingredients,
									view,
								},
							}));
						} catch (err) {
							// console.error({ err });
						}
						({ containers } = data.createContainers);
						return containers;
					},
					ingredient(_, { value }) {
						// console.warn(`... [withData] ingredient ${ value }`);
						// get all ingredients from the cache
						let { ingredients } = cache.readQuery({ query: GET_ALL_INGREDIENTS_QUERY });
						if (!value || value === '') return null;
						const adjusted = value.toLowerCase();
						console.warn({ adjusted });

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

							console.warn({ suggestions });
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
					viewIngredients(_, { view }) {
						// console.warn(`... [withData](${ view }) viewIngredients query resolver`);
						// get all ingredients from the cache
						let { ingredients } = cache.readQuery({ query: GET_ALL_INGREDIENTS_QUERY });

						// filter ingredients based on the view
						if (view === 'new') {
							ingredients = ingredients.filter((i) => !i.isValidated);
						}
						if (view === 'search') {
							// TODO
						}

						// pare down the ingredient info to match the ContainerIngredient shape
						ingredients = ingredients.map((i) => ({
							__typename: 'ContainerIngredient',
							hasParent: Boolean(i.parent),
							id: i.id,
							isValidated: i.isValidated,
							name: i.name,
							plural: i.plural,
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
						// console.warn(`,,, [withData](${ group }, ingredientID: ${ ingredientID } ingredients: ${ ingredients.length }, ${ view }) createContainers mutation resolver`);
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
						// console.warn(`,,, [withData](${ id }, ${ isExpanded }) setContainerIsExpanded mutation resolver`);

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
						// console.warn(`,,, [withData](${ id }, ${ ingredientID }) setCurrentCard mutation resolver`);

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
