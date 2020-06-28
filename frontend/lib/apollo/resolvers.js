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
		suggestions(_, { type, value }, ctx) {
			console.log(`... [withData](${ type }, ${ value }) suggestions query resolver`);
			console.log({ ctx });
			const { client } = ctx;
			let suggestions = [];

			// determine the lookup query based on the type
			const query = GET_ALL_INGREDIENTS_QUERY;
			/* TODO i'll come back and support this later
			if (type === 'tags') {
				query = GET_ALL_TAGS_QUERY;
			} else if (type === 'categories') {
				query = GET_ALL_CATEGORIES_QUERY;
			}
			*/

			if (value && value.length > 0) {
				// get all ingredients from the cache
				const data = client.readQuery({ query });
				const { ingredients = [] } = data;
				suggestions = [ ...ingredients ];
				suggestions = data[type].filter((i) => (
					// return partial matches
					(i.name.indexOf(value) > -1)
					// ... as long as they're not an exact match on our input
					&& (i.name !== value)
				));
				suggestions.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
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
	// client-side mutation resolvers
	Mutation: {
		createContainers(_, { currentIngredientID = null, group = 'name', view = 'all' }, ctx) {
			// eslint-disable-next-line object-curly-newline
			// console.log('BUILD CONTAINERS MUTATION', { currentIngredientID });
			const { client } = ctx;
			const { ingredients = [] } = client.readQuery({ query: GET_ALL_INGREDIENTS_QUERY });
			const sortedIngredients = ingredients.sort((a, b) => a.name.localeCompare(b.name));

			const response = {
				__typename: 'ContainerResponse',
				errors: [],
				containers: [],
			};

			// can we get the view and group here?, or should these be passed in as variables
			// writeQuery containers with these variables
			const data = {
				__typename: 'Container',
				containers: buildContainers(currentIngredientID, group, view, sortedIngredients)
					.map((c) => ({
						...c,
						ingredients: sortedIngredients,
						nextIngredientID: getNextIngredientID({
							ingredientID: currentIngredientID,
							ingredients: sortedIngredients,
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

			response.containers = [ ...data.containers ];

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
