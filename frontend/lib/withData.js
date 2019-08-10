import ApolloClient, { InMemoryCache } from 'apollo-boost';
import gql from 'graphql-tag';
import withApollo from 'next-with-apollo';
import { GET_ALL_INGREDIENTS_QUERY } from '../pages/ingredients';
import { endpoint } from '../config';
/* eslint-disable object-curly-newline */
import {
	generateContainerByCount,
	generateContainerByName,
	generateContainerByProperty,
	generateContainerByRelationship,
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

	type Properties {
		id: ID!
		meat: Boolean!
		poultry: Boolean!
		fish: Boolean!
		dairy: Boolean!
		soy: Boolean!
		gluten: Boolean!
	}

	type CreateContainersResponse {
    containers: [Container]
  }

	type Query {
		viewIngredients: [ ContainerIngredient ]!
		containers: [ Container ]!
	}

	type Mutation {
   	createContainers(
	  	group: String!
			ingredientID: String!
			ingredients: [ ContainerIngredient ]!
			view: String!
    ) : CreateContainersResponse
	}
`;

const GET_CONTAINERS_QUERY = gql`
	query GET_CONTAINERS_QUERY($group: String, $view: String) {
		containers(group: $group, view: $view) @client {
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
	}
`;

const CREATE_CONTAINERS_MUTATION = gql`
	mutation createContainers(
		$group: String!
		$ingredientID: String!
		$ingredients: [ ContainerIngredient ]!
		$view: String!
	) {
		createContainers(
			group: $group
			ingredientID: $ingredientID,
			ingredients: $ingredients
			view: $view
		) @client {
			containers {
				count
				id
				ingredientID
				ingredients
				isExpanded
				label
			}
		}
	}
`;

const GET_VIEW_INGREDIENTS_QUERY = gql`
	query GET_VIEW_INGREDIENTS_QUERY($view: String) {
		viewIngredients(view: $view) @client {
			hasParent @client
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
			referenceCount @client
		}
	}
`;

function createClient({ headers }) {
	const cache = new InMemoryCache();

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
					async containers(_, { group, view }, { client }) {
						console.warn(`... [withData](${ group }, ${ view }) containers query resolver`);
						let containers = [];
						let ingredients = [];

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
								ingredients,
								view,
							},
						});

						({ containers } = data.createContainers);

						console.log({ containers });

						return containers;
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
							name: i.isValidated,
							properties: { ...i.properties },
							referenceCount: 0,
						}));

						return ingredients;
					},
				},
				Mutation: {
					// eslint-disable-next-line object-curly-newline
					createContainers(_, { ingredientID, group, ingredients, view }) {
						// eslint-disable-next-line max-len
						console.warn(`,,, [withData](${ ingredientID }, ${ group }, ingredients: ${ ingredients.length }, ${ view } }) createContainers mutation resolver`);
						let containers = [];

						switch (group) {
						case 'count':
							containers = generateContainerByCount(ingredientID, ingredients);
							break;
						case 'property':
							containers = generateContainerByProperty(ingredientID, ingredients);
							break;
						case 'relationship':
							containers = generateContainerByRelationship(ingredientID, ingredients);
							break;
						default:
							containers = generateContainerByName(ingredientID, ingredients, view);
							break;
						}

						console.warn({ containers });

						return {
							__typename: 'CreateContainersResponse',
							containers,
						};
					},
				},
			},
			typeDefs,
		},
	});
}

export default withApollo(createClient);
