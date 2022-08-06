import { gql, useMutation, useQuery } from '@apollo/client';

import { GET_ALL_CONTAINERS_QUERY } from '../graphql/queries/container';
import { TOGGLE_CONTAINER_MUTATION, TOGGLE_CONTAINER_INGREDIENT_MUTATION } from '../graphql/mutations/container';

function useContainers({ group = 'name', view = 'all' }) {
  const {
    data = {},
    loading,
    refetch,
  } = useQuery(GET_ALL_CONTAINERS_QUERY, {
    variables: { group, view },
  });
  console.log('use-containers', { loading })
  const containers: unknown[] = data?.containers ?? [];

  const [toggleContainer] = useMutation(TOGGLE_CONTAINER_MUTATION, {
    // TODO can this just be accomplished in the prior resolver? similar to how toggle ingredient works?
    update: async (cache, { data: { toggleContainer } }) => {
      const res = cache.readQuery({
        query: GET_ALL_CONTAINERS_QUERY,
        variables: { group, view },
      });

      const updated = res.containers.map((ctn) => ({
        ...ctn,
        isExpanded: ctn.id === toggleContainer.id ? !ctn.isExpanded : ctn.isExpanded,
      }));

      cache.writeQuery({
        query: GET_ALL_CONTAINERS_QUERY,
        variables: { group, view },
        data: { containers: updated }
      });
    },
  });

  const [toggleContainerIngredient] = useMutation(TOGGLE_CONTAINER_INGREDIENT_MUTATION);

  function onContainerClick(id: string) {
    toggleContainer({ variables: { id } });
  }

  function onIngredientClick(containerId: string, ingredientId: string | null) {
    toggleContainerIngredient({ variables: { containerId, ingredientId }})
  }

  return {
    onContainerClick,
    onIngredientClick,
    containers,
    loading,
    refetch,
  };
}

export default useContainers;
