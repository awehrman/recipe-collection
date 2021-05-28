import { gql } from '@apollo/client';
import { BASIC_INGREDIENT_FIELDS } from './ingredients';

export const ALL_CONTAINER_FIELDS = gql`
	fragment ContainerFields on Container {
		id
		ingredientID
		ingredients {
			...BasicIngredientFields
		}
		isExpanded
		label
		nextIngredientID
		referenceCount
	}
	${ BASIC_INGREDIENT_FIELDS }
`;

export const toggleIngredientID = gql`
	fragment toggleIngredientID on Container {
		ingredientID
	}
`;

export const toggleNextIngredientID = gql`
	fragment toggleNextIngredientID on Container {
		nextIngredientID
	}
`;

export const getContainerIngredients = gql`
	fragment getContainerIngredients on Container {
		ingredients {
			...BasicIngredientFields
		}
	}
	${ BASIC_INGREDIENT_FIELDS }
`;

export const setIsExpanded = gql`
	fragment setIsExpanded on Container {
		isExpanded
	}
`;

export default {
	ALL_CONTAINER_FIELDS,
	getContainerIngredients,
	setIsExpanded,
	toggleIngredientID,
	toggleNextIngredientID,
};
