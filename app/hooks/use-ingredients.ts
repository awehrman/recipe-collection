import { useQuery } from '@apollo/client';
import _ from 'lodash';

import { GET_ALL_INGREDIENTS_QUERY } from '../graphql/queries/ingredient';

function useIngredients() {
  const {
    data = {},
    loading,
    refetch,
  } = useQuery(GET_ALL_INGREDIENTS_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  let ingredients: unknown[] = data?.ingredients ?? [];
  ingredients = [...ingredients].sort((a, b) => a.name.localeCompare(b.name));

  const ingredientsCount = !loading ? ingredients.length : 0;
  const newIngredientsCount = !loading
    ? _.reject(ingredients, 'isValidated').length
    : 0;

  return {
    loading,
    ingredients,
    ingredientsCount,
    newIngredientsCount,
    refetchIngredients: refetch,
  };
}

export default useIngredients;
