import { gql } from '@apollo/client';
import { ALL_RECIPE_FIELDS } from '../fragments/recipes';

export const CREATE_RECIPE_MUTATION = gql`
	mutation CREATE_RECIPE_MUTATION($data: RecipeCreateInput!) {
		createRecipe(
			data: $data
		) {
			errors
			recipe {
				...RecipeFields
			}
		}
	}
	${ ALL_RECIPE_FIELDS }
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
				...RecipeFields
			}
		}
  }
	${ ALL_RECIPE_FIELDS }
`;
