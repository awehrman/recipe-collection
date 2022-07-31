import { gql, useMutation, useQuery } from '@apollo/client';

import {
  GET_ALL_CONTAINERS_QUERY,
  GET_CONTAINER_QUERY,
} from '../graphql/queries/container';
import { TOGGLE_CONTAINER_MUTATION } from '../graphql/mutations/container';
import { update } from 'lodash';

function useContainers({ group = 'name', view = 'all' }) {
  const {
    data = {},
    loading,
    refetch,
  } = useQuery(GET_ALL_CONTAINERS_QUERY, {
    variables: { group, view },
  });
  const containers: unknown[] = data?.containers ?? [];
  console.log({ containers });
  const [toggleContainer] = useMutation(TOGGLE_CONTAINER_MUTATION, {
    // refetchQueries: [
    //   { query: GET_ALL_CONTAINERS_QUERY, variables: { group, view } },
    // ],
    update: async (cache, { data: { toggleContainer } }) => {
      console.log('toggle update', group, view);
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

  function onContainerClick(id: string) {
    toggleContainer({ variables: { id } });
  }

  return {
    onContainerClick,
    containers,
    loading,
    refetch,
  };
}

export default useContainers;
