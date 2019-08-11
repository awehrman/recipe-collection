import gql from 'graphql-tag';

/* Containers */
export const GET_CONTAINERS_QUERY = gql`
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


export default [
	GET_CONTAINERS_QUERY,
	GET_VIEW_INGREDIENTS_QUERY,
	GET_INGREDIENTS_COUNT_QUERY,
	GET_ALL_INGREDIENTS_QUERY,
];
