import gql from 'graphql-tag';

/* Containers */
export const GET_CONTAINER_QUERY = gql`
	query GET_CONTAINER_QUERY($id: String!) {
		container(id: $id) @client {
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
			}
			isExpanded
			label
			referenceCount
		}
	}
`;

export const GET_CONTAINERS_QUERY = gql`
	query GET_CONTAINERS_QUERY($group: String, $ingredientID: String, $view: String) {
		containers(group: $group, ingredientID: $ingredientID, view: $view) @client {
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
			}
			isExpanded
			label
			referenceCount
		}
	}
`;

export const GET_VIEW_INGREDIENTS_QUERY = gql`
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

/* Ingredients */
export const GET_INGREDIENTS_COUNT_QUERY = gql`
  query GET_INGREDIENTS_COUNT_QUERY {
  	ingredientAggregate {
	  	ingredientsCount
			newIngredientsCount
		}
  }
`;

export const GET_ALL_INGREDIENTS_QUERY = gql`
  query GET_ALL_INGREDIENTS_QUERY {
  	ingredients {
  		id
			name
			plural
			alternateNames {
				name
			}
			properties {
				meat
			  poultry
			  fish
			  dairy
			  soy
			  gluten
			}
			parent {
				id
			}
			isComposedIngredient
			isValidated
		}
  }
`;

export const GET_INGREDIENT_BY_VALUE_QUERY = gql`
  query GET_INGREDIENT_BY_VALUE_QUERY($value: String!) {
  	ingredient(value: $value) @client {
			id
			name
		}
  }
`;

export default [
	GET_CONTAINER_QUERY,
	GET_CONTAINERS_QUERY,
	GET_VIEW_INGREDIENTS_QUERY,
	GET_INGREDIENTS_COUNT_QUERY,
	GET_INGREDIENT_BY_VALUE_QUERY,
	GET_ALL_INGREDIENTS_QUERY,
];
