import { useQuery } from '@apollo/client';
import _ from 'lodash';

import { GET_INGREDIENT_QUERY } from '../graphql/queries/ingredient';

function useIngredient({ id }) {
  const {
    data = {},
    loading,
    refetch,
  } = useQuery(GET_INGREDIENT_QUERY, {
    variables: { id }
  });
  let ingredient: unknown[] = data?.ingredient ?? [];

  return {
    loading,
    ingredient,
    refetchIngredient: refetch,
  };
}

export default useIngredient;
