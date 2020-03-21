import { gql } from '@apollo/client';
import { ALL_INGREDIENT_FIELDS } from '../fragments/ingredients';

export const CREATE_INGREDIENT_MUTATION = gql`
	mutation createIngredient($data: IngredientCreateInput!) {
		createIngredient(
			data: $data
		) {
			errors
			ingredient {
				...IngredientFields
			}
		}
	}
	${ ALL_INGREDIENT_FIELDS }
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
				...IngredientFields
			}
		}
  }
	${ ALL_INGREDIENT_FIELDS }
`;

export default {
	CREATE_INGREDIENT_MUTATION,
	UPDATE_INGREDIENT_MUTATION,
};
