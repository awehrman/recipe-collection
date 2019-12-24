import gql from 'graphql-tag';
// import { ContainerFields } from './fragments';

// TODO utilize fragments here and clean this file up

/* Containers */
export const GET_CONTAINER_QUERY = gql`
	query GET_CONTAINER_QUERY($id: String!) {
		container(id: $id) @client {
			id
			ingredientID
			ingredients {
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
		}
	}
`;

export const GET_ALL_CONTAINERS_QUERY = gql`
	query GET_ALL_CONTAINERS_QUERY($group: String, $view: String) {
		containers(group: $group, view: $view) @client {
			id
			ingredientID
			ingredients {
				id
				isValidated
				name
				parent {
					id
					name
				}
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
			references {
				id
				recipe {
					id
				}
				line {
					reference
				}
			}
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
				recipe {
					id
				}
				line {
					reference
				}
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
			categories {
				id
				name
			}
			tags {
				id
				name
			}
			evernoteGUID
			image
			source
			title
			ingredients {
				id
				blockIndex
				isParsed
				lineIndex
				parsed {
					id
					ingredient {
						id
						isValidated
						name
					}
					rule
					type
					value
				}
				reference
				rule
			}
			instructions {
				blockIndex
				reference
			}
		}
  }
`;

export const GET_PAGINATED_RECIPES_QUERY = gql`
  query GET_PAGINATED_RECIPES_QUERY($cursor: Int) {
  	recipes(cursor: $cursor) {
			count
			errors
			recipes {
				id
				image
				title
			}
		}
  }
`;

export const GET_CURRENT_RECIPE_QUERY = gql`
	query GET_CURRENT_RECIPE_QUERY($id: ID) {
		recipe(where: { id: $id }) {
			id
			categories {
				id
				name
			}
			tags {
				id
				name
			}
			evernoteGUID
			image
			source
			title
			ingredients {
				id
				blockIndex
				isParsed
				lineIndex
				parsed {
					id
					ingredient {
						id
						isValidated
						name
					}
					rule
					type
					value
				}
				reference
				rule
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
export const GET_NOTES_COUNT_QUERY = gql`
  query GET_NOTES_COUNT_QUERY {
  	noteAggregate {
	  	count
			importDefault
		}
  }
`;

export const GET_ALL_NOTES_QUERY = gql`
  query GET_ALL_NOTES_QUERY {
  	notes {
  		id
			content
			title
			ingredients {
				id
				reference
				isParsed
				blockIndex
				lineIndex
				parsed {
					id
					ingredient {
						id
						isValidated
						name
					}
					rule
					type
					value
				}
			}
			instructions {
				id
				blockIndex
				reference
			}
		}
  }
`;

export const IS_EVERNOTE_AUTHENTICATED_QUERY = gql`
  query IS_EVERNOTE_AUTHENTICATED_QUERY {
  	isEvernoteAuthenticated {
  		errors
			isAuthenticationPending
			isAuthenticated
  	}
  }
`;

/* Dashboard */

export const GET_DASHBOARD_INGREDIENTS_QUERY = gql`
  query GET_DASHBOARD_INGREDIENTS_QUERY {
  	dashboardIngredients {
			errors
			newlyVerified {
				id
				name
			}
			newlyParsed {
				id
				name
			}
			numIngredients
			numUnverified
			numLines
			numRecipes
		}
  }
`;

export const GET_DASHBOARD_PARSING_QUERY = gql`
  query GET_DASHBOARD_PARSING_QUERY {
  	dashboardParsing {
			errors
			parsingInstances {
				id
				reference
			}
			parsingErrors
			semanticErrors
			dataErrors
			instruction
			equipment
			baseRate
			adjustedRate
			parsingRate
			dataAccuracy
		}
  }
`;

export const GET_DASHBOARD_RECIPES_QUERY = gql`
  query GET_DASHBOARD_RECIPES_QUERY {
  	dashboardRecipes {
			errors
			newRecipes {
				id
				image
				title
			}
		}
  }
`;

export default [
	GET_CONTAINER_QUERY,
	GET_ALL_CONTAINERS_QUERY,
	GET_ALL_CATEGORIES_QUERY,
	GET_SUGGESTED_CATEGORIES_QUERY,
	GET_ALL_TAGS_QUERY,
	GET_SUGGESTED_TAGS_QUERY,
	GET_INGREDIENTS_COUNT_QUERY,
	GET_INGREDIENT_BY_VALUE_QUERY,
	GET_INGREDIENT_BY_ID_QUERY,
	GET_ALL_INGREDIENTS_QUERY,
	GET_SUGGESTED_INGREDIENTS_QUERY,
	GET_RECIPES_COUNT_QUERY,
	GET_ALL_RECIPES_QUERY,
	GET_NOTES_COUNT_QUERY,
	GET_ALL_NOTES_QUERY,
	IS_EVERNOTE_AUTHENTICATED_QUERY,
	GET_DASHBOARD_INGREDIENTS_QUERY,
	GET_DASHBOARD_PARSING_QUERY,
	GET_DASHBOARD_RECIPES_QUERY,
	GET_PAGINATED_RECIPES_QUERY,
	GET_CURRENT_RECIPE_QUERY,
];
