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
				id
				ingredientID
				ingredients {
					hasParent
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
					referenceCount
				}
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

export const CREATE_INGREDIENT_MUTATION = gql`
	mutation createIngredient(
		$parentID: ID,
		$parentName: String,
		$name: String!,
		$plural: String,
		$properties: PropertiesCreateInput,
		$alternateNames: [ String ],
		$relatedIngredients: [ String ],
		$substitutes: [ String ],
		$references: [ String ],
		$isValidated: Boolean,
		$isComposedIngredient: Boolean
	) {
		createIngredient(
			parentID: $parentID
			parentName: $parentName
			name: $name
			plural: $plural
			properties: $properties
			alternateNames: $alternateNames
			relatedIngredients: $relatedIngredients
			substitutes: $substitutes
			references: $references
			isValidated: $isValidated
			isComposedIngredient: $isComposedIngredient
		) {
			parent {
				id
			}
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
			references {
				id
			}
		}
	}
`;

export default [
	CREATE_CONTAINERS_MUTATION,
	UPDATE_CONTAINER_INGREDIENT_ID_MUTATION,
	UPDATE_IS_CONTAINER_EXPANDED_MUTATION,
	CREATE_INGREDIENT_MUTATION,
];
