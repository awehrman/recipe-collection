import { gql } from '@apollo/client';
import { BASIC_INGREDIENT_FIELDS, ALL_INGREDIENT_FIELDS } from '../fragments/ingredients';

export const GET_ALL_INGREDIENTS_QUERY = gql`
  query GET_ALL_INGREDIENTS_QUERY {
  	ingredients {
  		...BasicIngredientFields
		}
  }
	${ BASIC_INGREDIENT_FIELDS }
`;

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

export const GET_INGREDIENT_QUERY = gql`
  query GET_INGREDIENT_QUERY($id: ID, $name: String) {
  	ingredient(where: { id: $id, name: $name }) {
			...IngredientFields
		}
  }
	${ ALL_INGREDIENT_FIELDS }
`;

export const GET_INGREDIENTS_COUNT_QUERY = gql`
  query GET_INGREDIENTS_COUNT_QUERY {
  	ingredientAggregate {
			count
			unverified
		}
  }
`;

export default {
	GET_ALL_INGREDIENTS_QUERY,
	GET_DASHBOARD_INGREDIENTS_QUERY,
	GET_INGREDIENT_QUERY,
	GET_INGREDIENTS_COUNT_QUERY,

};
