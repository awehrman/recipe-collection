import { List as ImmutableList } from 'immutable';
import buildContainers from '../buildContainers';
import { setIsExpanded } from './fragments';
// import { CREATE_CONTAINERS_MUTATION } from './mutations';
import { GET_ALL_CONTAINERS_QUERY, GET_ALL_INGREDIENTS_QUERY } from './queries';

export default {
	// assign client side field values
	Ingredient: {
		hasParent: ({ parent }) => Boolean(parent) || false,
		referenceCount: ({ references }) => (references ? references.length : 0),
	},
	// client-side query resolvers
	Query: {
		container(_, { id }, { client, group, view }) {
			console.log('CONTAINER QUERY', id);

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
			console.log('CONTAINERS QUERY', { group, view });
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
				console.log('no matching containers found in cache');
			}
			console.warn({ ...containers });
			return containers;
		},
	},
	// client-side mutation resolvers
	Mutation: {
		createContainers(_, { group = 'name', view = 'all' }, ctx) {
			// eslint-disable-next-line object-curly-newline
			console.log('BUILD CONTAINERS MUTATION', { ctx, group, view });
			const { client, currentIngredientID = null } = ctx; // don't store the ingredients in here, we can always query those ourself here
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
						ingredients: c.ingredients.toJS(),
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
		toggleContainer(_, { id, isExpanded }, { cache }) {
			console.log('TOGGLE CONTAINER');

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
