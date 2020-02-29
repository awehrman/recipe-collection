import { gql } from '@apollo/client';

export const getContainer = gql`
	fragment getContainer on Container {
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
`;

export const setCurrentCard = gql`
	fragment setCurrentCard on Container {
		ingredientID
	}
`;

export const setIsExpanded = gql`
	fragment setIsExpanded on Container {
		isExpanded
	}
`;

export const PROPERTY_FIELDS = gql`
	fragment PropertyFields on Property {
		id
		meat
		poultry
		fish
		dairy
		soy
		gluten
	}
`;

export const ALL_INGREDIENT_FIELDS = gql`
	fragment AllIngredientFields on Ingredient {
		id
		name
		plural
		alternateNames {
			name
		}
		properties {
			id
			meat
			poultry
			fish
			dairy
			soy
			gluten
		}
		isComposedIngredient
		isValidated
		parent {
			id
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
				id
				reference
			}
		}
	}
`;

export const BASIC_INGREDIENT_FIELDS = gql`
	fragment BasicIngredientFields on Ingredient {
		id
		alternateNames {
			name
		}
		hasParent @client
		parent {
			id
		}
		isComposedIngredient
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
		references {
			id
		}
	}
`;

export const BASIC_CLIENT_INGREDIENT_FIELDS = gql`
	fragment BasicClientIngredientFields on Ingredient {
		id
		alternateNames {
			name
		}
		hasParent @client
		isComposedIngredient
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
`;

export const ALL_CONTAINER_FIELDS = gql`
	fragment ContainerFields on Container {
		id
		ingredientID
		ingredients {
			...BasicClientIngredientFields
		}
		isExpanded
		label
		referenceCount
	}
	${ BASIC_CLIENT_INGREDIENT_FIELDS }
`;

export const ALL_RECIPE_FIELDS = gql`
	fragment AllRecipeFields on Recipe {
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
`;

export default [
	getContainer,
	setCurrentCard,
	setIsExpanded,
	PROPERTY_FIELDS,
	ALL_INGREDIENT_FIELDS,
	BASIC_INGREDIENT_FIELDS,
	BASIC_CLIENT_INGREDIENT_FIELDS,
	ALL_CONTAINER_FIELDS,
	ALL_RECIPE_FIELDS,
];
