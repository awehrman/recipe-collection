import gql from 'graphql-tag';

export const CREATE_CONTAINERS_MUTATION = gql`
	mutation createContainers(
		$group: String!
		$ingredientID: String
		$ingredients: [ ContainerIngredient ]!
		$view: String!
	) {
		createContainers(
			group: $group
			ingredientID: $ingredientID
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

export const UPDATE_CONTAINER_INGREDIENT_ID_MUTATION = gql`
	mutation setCurrentCard(
		$id: ID!,
		$ingredientID: Boolean
	) {
		setCurrentCard(
			id: $id,
			ingredientID: $ingredientID
		) @client
	}
`;

export const UPDATE_IS_CONTAINER_EXPANDED_MUTATION = gql`
	mutation setContainerIsExpanded(
		$id: ID!,
		$isExpanded: Boolean
	) {
		setContainerIsExpanded(
			id: $id,
			isExpanded: $isExpanded
		) @client
	}
`;

export default [
	CREATE_CONTAINERS_MUTATION,
	UPDATE_CONTAINER_INGREDIENT_ID_MUTATION,
	UPDATE_IS_CONTAINER_EXPANDED_MUTATION,
];
