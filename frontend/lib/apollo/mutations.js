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
					referenceCount @client
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
	mutation createIngredient($data: IngredientCreateInput!) {
		createIngredient(
			data: $data
		) {
			errors
			ingredient {
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
					recipe {
						id
					}
					line {
						reference
					}
				}
			}
		}
	}
`;

export const UPDATE_INGREDIENT_MUTATION = gql`
  mutation UPDATE_INGREDIENT_MUTATION(
		$data: IngredientUpdateInput!,
		$where: IngredientWhereUniqueInput!
	) {
    updateIngredient(
    	data: $data,
			where: $where
    ) {
			errors
			ingredient {
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
  }
`;

export const CREATE_RECIPE_MUTATION = gql`
	mutation CREATE_RECIPE_MUTATION($data: RecipeCreateInput!) {
		createRecipe(
			data: $data
		) {
			errors
			recipe {
				evernoteGUID
				id
				title
				source
			}
		}
	}
`;

export const UPDATE_RECIPE_MUTATION = gql`
  mutation UPDATE_RECIPE_MUTATION(
		$data: RecipeUpdateInput!,
		$where: RecipeWhereUniqueInput!
	) {
    updateRecipe(
    	data: $data,
			where: $where
    ) {
			errors
			recipe {
				id
				evernoteGUID
				title
				source
				image
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
					id
					blockIndex
					reference
				}
			}
		}
  }
`;

export const PARSE_NOTES_MUTATION = gql`
	mutation PARSE_NOTES_MUTATION {
		parseNotes {
			errors
			notes {
				id
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
					id
					blockIndex
					reference
				}
				title
			}
		}
	}
`;

export const IMPORT_NOTES_MUTATION = gql`
	mutation IMPORT_NOTES_MUTATION {
		importNotes {
			errors
			notes {
				id
				content
				ingredients {
					id
				}
				instructions {
					id
				}
				title
			}
		}
	}
`;

export const CONVERT_NOTES_MUTATION = gql`
	mutation CONVERT_NOTES_MUTATION {
		convertNotes {
			errors
			recipes {
				id
			}
		}
	}
`;

export const AUTHENTICATE_EVERNOTE_MUTATION = gql`
	mutation AUTHENTICATE_EVERNOTE_MUTATION($oauthVerifier: String) {
		authenticate(oauthVerifier: $oauthVerifier) {
			errors
			isAuthenticationPending
			isAuthenticated
			authURL
		}
	}
`;

export const CLEAR_EVERNOTE_AUTH_MUTATION = gql`
	mutation CLEAR_EVERNOTE_AUTH_MUTATION {
		clearAuthentication {
			errors
			isAuthenticationPending
			isAuthenticated
			authURL
		}
	}
`;

export default [
	CREATE_CONTAINERS_MUTATION,
	UPDATE_CONTAINER_INGREDIENT_ID_MUTATION,
	UPDATE_IS_CONTAINER_EXPANDED_MUTATION,
	CREATE_INGREDIENT_MUTATION,
	UPDATE_INGREDIENT_MUTATION,
	CREATE_RECIPE_MUTATION,
	UPDATE_RECIPE_MUTATION,
	PARSE_NOTES_MUTATION,
	IMPORT_NOTES_MUTATION,
	CONVERT_NOTES_MUTATION,
	AUTHENTICATE_EVERNOTE_MUTATION,
	CLEAR_EVERNOTE_AUTH_MUTATION,
];
