import { List as ImmutableList } from 'immutable';
import buildContainers from '../buildContainers';
import { setIsExpanded, toggleIngredientID, toggleNextIngredientID, getContainerIngredients } from './fragments/containers';
import { GET_ALL_CONTAINERS_QUERY } from './queries/containers';
import { GET_ALL_INGREDIENTS_QUERY } from './queries/ingredients';

// TODO move to a util file
function getNextIngredientID(c) {
	if (c.ingredientID) {
		const currentIndex = c.ingredients.findIndex((i) => i.id === c.ingredientID);
		const nextIngredientIndex = currentIndex + 1;

		// if the next item in the list exists then return that id
		if (c.ingredients.length && c.ingredients[nextIngredientIndex]) {
			return c.ingredients[nextIngredientIndex].id;
		}

		// otherwise if we were at the end of the list, go-to the first item
		if (c.ingredients.length && c.ingredients[0]) {
			return c.ingredients[0].id;
		}
	}
	return null;
}

export default {
	// assign client side field values
	Ingredient: {
		hasParent: ({ parent }) => Boolean(parent) || false,
		referenceCount: ({ references }) => (references ? references.length : 0),
	},
	// client-side query resolvers
	Query: {
		container(_, { id }, { client, group, view }) {
			// console.log('CONTAINER QUERY', id, group, view);

			const { containers } = client.readQuery({
				query: GET_ALL_CONTAINERS_QUERY,
				variables: {
					group,
					view,
				},
			});

			const container = containers.find((c) => c.id === id);
			return container;
		},
		containers(_, { group, view }, { client }) {
			// eslint-disable-next-line object-curly-newline
			// console.log('CONTAINERS QUERY', { group, view });
			let containers = [];
			try {
				({ containers } = client.readQuery({
					query: GET_ALL_CONTAINERS_QUERY,
					variables: {
						group,
						view,
					},
				}));
			} catch (e) {
				// no containers found in the cache
				// console.log('no matching containers found in cache');
			}
			return containers;
		},
	},
	// client-side mutation resolvers
	Mutation: {
		createContainers(_, { currentIngredientID = null, group = 'name', view = 'all' }, ctx) {
			// eslint-disable-next-line object-curly-newline
			// console.log('BUILD CONTAINERS MUTATION', { currentIngredientID });
			const { client } = ctx;
			const { ingredients } = client.readQuery({ query: GET_ALL_INGREDIENTS_QUERY });

			const response = {
				__typename: 'ContainersResponse',
				errors: [],
				result: { containers: new ImmutableList() },
			};

			// can we get the view and group here?, or should these be passed in as variables
			// writeQuery containers with these variables
			const data = {
				containers: buildContainers(currentIngredientID, group, view, ingredients)
					.map((c) => ({
						...c,
						// TODO ugh what a mess, try to tidy this all up
						ingredients: c.ingredients.toJS().sort((a, b) => a.name.localeCompare(b.name)),
						nextIngredientID: getNextIngredientID({
							ingredientID: currentIngredientID,
							ingredients: c.ingredients.toJS().sort((a, b) => a.name.localeCompare(b.name)),
						}),
					})),
			};

			client.writeQuery({
				data,
				query: GET_ALL_CONTAINERS_QUERY,
				variables: {
					group,
					view,
				},
			});

			response.result = data;

			return response;
		},
		toggleIngredientID(_, { id, ingredientID }, { cache }) {
			// eslint-disable-next-line object-curly-newline
			// console.log('TOGGLE CONTAINER INGREDIENT', { id, ingredientID });
			if (!id) {
				return {
					__typename: 'ContainerResponse',
					errors: [ { message: 'No id parameter provided!' } ],
				};
			}

			const fragment = cache.readFragment({
				fragment: toggleIngredientID,
				id: `Container:${ id }`,
				fragmentName: 'toggleIngredientID',
			});

			const updatedIngredientID = (ingredientID !== fragment.ingredientID) ? ingredientID : null;

			cache.writeFragment({
				fragment: toggleIngredientID,
				id: `Container:${ id }`,
				data: {
					__typename: 'Container',
					// if we click on the current ingredient, we'll collapse the card
					ingredientID: updatedIngredientID,
				},
			});

			const ingFrag = cache.readFragment({
				fragment: getContainerIngredients,
				id: `Container:${ id }`,
				fragmentName: 'getContainerIngredients',
			});

			const nextIngredientID = getNextIngredientID({
				ingredientID: updatedIngredientID,
				ingredients: ingFrag.ingredients,
			});

			cache.writeFragment({
				fragment: toggleNextIngredientID,
				id: `Container:${ id }`,
				data: {
					__typename: 'Container',
					nextIngredientID,
				},
			});

			return {
				__typename: 'ContainerResponse',
				errors: [],
			};
		},
		toggleContainer(_, { id, isExpanded }, { cache }) {
			// console.log('TOGGLE CONTAINER');

			cache.writeFragment({
				fragment: setIsExpanded,
				id: `Container:${ id }`,
				data: {
					__typename: 'Container',
					isExpanded,
				},
			});

			return {
				__typename: 'ContainerResponse',
				errors: [],
			};
		},
	},
};
