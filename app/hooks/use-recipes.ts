import { useQuery } from '@apollo/client';

import { GET_ALL_RECIPES_QUERY } from '../graphql/queries/recipe';

function useRecipes() {
  const {
    data = {},
    loading,
    refetch,
  } = useQuery(GET_ALL_RECIPES_QUERY, {
    fetchPolicy: 'cache-and-network',
  });

  let recipes: unknown[] = data?.recipes ?? [];
  recipes = [...recipes].sort((a, b) => a.title.localeCompare(b.title));

  return {
    loading,
    recipes,
    refetchRecipes: refetch,
  };
}

export default useRecipes;
