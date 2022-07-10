import { useQuery } from '@apollo/client';

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

  return {
    loading,
    ingredients,
    refetchIngredients: refetch,
  };
}

export default useIngredients;
