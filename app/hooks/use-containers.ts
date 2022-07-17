import { useMutation, useQuery } from '@apollo/client';

import { GET_ALL_CONTAINERS_QUERY, GET_CONTAINER_QUERY } from '../graphql/queries/container';
import { TOGGLE_CONTAINER_MUTATION } from '../graphql/mutations/container';

function useContainers({ group = 'name', view = 'all'}) {
  const {
    data = {},
    loading,
    refetch,
  } = useQuery(GET_ALL_CONTAINERS_QUERY, {
    fetchPolicy: 'cache-and-network',
    variables: { group, view }
  });

  const containers: unknown[] = data?.containers ?? [];

  const [toggleContainer] = useMutation(TOGGLE_CONTAINER_MUTATION, {
    update: (cache, { data: { toggleContainer }}) => {
      console.log('toggle update', toggleContainer.id);
      // why is this always returning null?
      const res = cache.readQuery({
        query: GET_CONTAINER_QUERY,
        variables: { id: toggleContainer.id }
      });
      console.log({ res });
    },
  });

  function onContainerClick(id: string) {
    toggleContainer({ variables: { id }});
  }

  return {
    onContainerClick,
    containers,
    loading,
    refetch,
  };
}

export default useContainers;
