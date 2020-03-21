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
		referenceCount
	}
	${ BASIC_INGREDIENT_FIELDS }
`;

export const toggleIngredientID = gql`
	fragment toggleIngredientID on Container {
		ingredientID
	}
`;

export const setIsExpanded = gql`
	fragment setIsExpanded on Container {
		isExpanded
	}
`;

export default {
	ALL_CONTAINER_FIELDS,
	setIsExpanded,
	toggleIngredientID,
};
