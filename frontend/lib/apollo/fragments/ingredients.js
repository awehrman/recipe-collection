import { gql } from '@apollo/client';

export const ALL_INGREDIENT_FIELDS = gql`
	fragment IngredientFields on Ingredient {
		id
		name
		plural
		alternateNames {
			id
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
			id
			name
		}
		hasParent @client
		isComposedIngredient
		isValidated
		name
		plural
		properties {
			id
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

export default {
	ALL_INGREDIENT_FIELDS,
	BASIC_INGREDIENT_FIELDS,
	PROPERTY_FIELDS,
};
