import { gql } from '@apollo/client';
import { ALL_CONTAINER_FIELDS } from '../fragments/containers';

export const CREATE_CONTAINERS_MUTATION = gql`
	mutation createContainers(
		$currentIngredientID: String,
		$group: String!,
		$view: String!,
	) {
		createContainers(
			currentIngredientID: $currentIngredientID,
			group: $group,
			view: $view,
		) @client {
			errors
			containers {
				...ContainerFields
			}
		}
	}
	${ ALL_CONTAINER_FIELDS }
`;

export const UPDATE_CONTAINER_INGREDIENT_MUTATION = gql`
	mutation toggleIngredientID(
		$id: ID!,
		$ingredientID: Boolean,
		$name: String!,
	) {
		toggleIngredientID(
			id: $id,
			ingredientID: $ingredientID,
			name: $name,
		) @client {
			errors
		}
	}
`;

export const TOGGLE_CONTAINER_MUTATION = gql`
	mutation toggleContainer(
		$id: ID!,
		$isExpanded: Boolean!,
	) {
		toggleContainer(
			id: $id,
			isExpanded: $isExpanded,
		) @client {
			errors
		}
	}
`;

export default {
	CREATE_CONTAINERS_MUTATION,
	UPDATE_CONTAINER_INGREDIENT_MUTATION,
	TOGGLE_CONTAINER_MUTATION,
};
