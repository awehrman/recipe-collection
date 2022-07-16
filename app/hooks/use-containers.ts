import { useQuery } from '@apollo/client';

import { GET_ALL_CONTAINERS_QUERY } from '../graphql/queries/container';

function useContainers({ group = 'name', view = 'all'}) {
  const {
    data = {},
    loading,
    refetch,
  } = useQuery(GET_ALL_CONTAINERS_QUERY, { variables: { group, view } });

  const containers: unknown[] = data?.containers ?? [];
  console.log({ data });

  return {
    containers,
    loading,
    refetch,
  };
}

export default useContainers;
