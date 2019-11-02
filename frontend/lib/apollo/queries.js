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
	}
`;

export const GET_ALL_CONTAINERS_QUERY = gql`
	query GET_ALL_CONTAINERS_QUERY($group: String, $ingredientID: String, $view: String) {
		containers(group: $group, ingredientID: $ingredientID, view: $view) @client {
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
	}
`;

export const GET_VIEW_INGREDIENTS_QUERY = gql`
	query GET_VIEW_INGREDIENTS_QUERY($view: String) {
		viewIngredients(view: $view) @client {
			hasParent @client
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
			referenceCount @client
		}
	}
`;

export const GET_SUGGESTED_INGREDIENTS_QUERY = gql`
	query GET_SUGGESTED_INGREDIENTS_QUERY(
		$type: String
		$value: String
	) {
		suggestions(
			type: $type
			value: $value
		) @client {
			id
			name
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
			plural
			properties {
				meat
			  poultry
			  fish
			  dairy
			  soy
			  gluten
			}
			isValidated
		}
  }
`;

export const GET_INGREDIENT_BY_ID_QUERY = gql`
  query GET_INGREDIENT_BY_ID_QUERY($id: ID!) {
		ingredient(where: { id: $id }) {
			id
			parent {
				id
				name
			}
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
			alternateNames {
				name
			}
			relatedIngredients {
				id
				name
			}
			substitutes {
				id
				name
			}
			references {
				id
				reference
			}
			isValidated
      isComposedIngredient
		}
	}
`;

/* Recipes */
export const GET_RECIPES_COUNT_QUERY = gql`
  query GET_RECIPES_COUNT_QUERY {
  	recipeAggregate {
	  	recipesCount
		}
  }
`;

export const GET_ALL_RECIPES_QUERY = gql`
  query GET_ALL_RECIPES_QUERY {
  	recipes {
  		id
			evernoteGUID
			image
			source
			title
			categories {
				id
				name
			}
			tags {
				id
				name
			}
			ingredients {
				id
				blockIndex
				lineIndex
				reference
				rule
				isParsed
				parsed {
					rule
					type
					value
					ingredient {
						id
						name
					}
				}
			}
			instructions {
				blockIndex
				reference
			}
		}
  }
`;

/* Categories */
export const GET_ALL_CATEGORIES_QUERY = gql`
  query GET_ALL_CATEGORIES_QUERY {
  	categories {
  		id
			evernoteGUID
			name
		}
  }
`;

export const GET_SUGGESTED_CATEGORIES_QUERY = gql`
	query GET_SUGGESTED_CATEGORIES_QUERY(
		$type: String
		$value: String
	) {
		suggestions(
			type: $type
			value: $value
		) @client {
			id
			name
		}
	}
`;

/* Tags */
export const GET_ALL_TAGS_QUERY = gql`
  query GET_ALL_TAGS_QUERY {
  	tags {
  		id
			evernoteGUID
			name
		}
  }
`;

export const GET_SUGGESTED_TAGS_QUERY = gql`
	query GET_SUGGESTED_TAGS_QUERY(
		$type: String
		$value: String
	) {
		suggestions(
			type: $type
			value: $value
		) @client {
			id
			name
		}
	}
`;

/* Evernote */
export const GET_NOTES_QUERY = gql`
  query GET_NOTES_QUERY {
  	notes {
			id
			evernoteGUID
			title
			source
			image
			content
			categories
			tags
		}
  }
`;

export const GET_EVERNOTE_AUTH_TOKEN_QUERY = gql`
  query GET_EVERNOTE_AUTH_TOKEN_QUERY {
  	evernoteAuthToken
  }
`;

export default [
	GET_CONTAINER_QUERY,
	GET_ALL_CONTAINERS_QUERY,
	GET_ALL_CATEGORIES_QUERY,
	GET_SUGGESTED_CATEGORIES_QUERY,
	GET_ALL_TAGS_QUERY,
	GET_SUGGESTED_TAGS_QUERY,
	GET_VIEW_INGREDIENTS_QUERY,
	GET_INGREDIENTS_COUNT_QUERY,
	GET_INGREDIENT_BY_VALUE_QUERY,
	GET_INGREDIENT_BY_ID_QUERY,
	GET_ALL_INGREDIENTS_QUERY,
	GET_SUGGESTED_INGREDIENTS_QUERY,
	GET_RECIPES_COUNT_QUERY,
	GET_ALL_RECIPES_QUERY,
	GET_NOTES_QUERY,
	GET_EVERNOTE_AUTH_TOKEN_QUERY,
];
