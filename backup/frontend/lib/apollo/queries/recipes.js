import { gql } from '@apollo/client';
import { ALL_RECIPE_FIELDS } from '../fragments/recipes';


export const GET_ALL_RECIPES_QUERY = gql`
  query GET_ALL_RECIPES_QUERY($cursor: Int) {
  	recipes(cursor: $cursor) {
  		...RecipeFields
		}
  }
	${ ALL_RECIPE_FIELDS }
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

export const GET_PAGINATED_RECIPES_QUERY = gql`
  query GET_PAGINATED_RECIPES_QUERY($cursor: Int) {
  	recipes(cursor: $cursor) {
			id
			image
			title
		}
  }
`;

export const GET_RECIPE_QUERY = gql`
	query GET_RECIPE_QUERY($id: ID!) {
			recipe(where: { id: $id }) {
  		...RecipeFields
		}
  }
	${ ALL_RECIPE_FIELDS }
`;

export const GET_RECIPES_COUNT_QUERY = gql`
  query GET_RECIPES_COUNT_QUERY {
  	recipeAggregate {
	  	count
		}
  }
`;

export default {
	GET_ALL_RECIPES_QUERY,
	GET_DASHBOARD_RECIPES_QUERY,
	GET_PAGINATED_RECIPES_QUERY,
	GET_RECIPE_QUERY,
	GET_RECIPES_COUNT_QUERY,
};
