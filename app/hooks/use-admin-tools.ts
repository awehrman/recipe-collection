import { gql, useMutation } from '@apollo/client';

import { GET_ALL_NOTES_QUERY } from '../graphql/queries/note';

export const RESET_DATABASE_MUTATION = gql`
	mutation RESET_DATABASE_MUTATION {
		resetDatabase {
			error
		}
	}
`;

function useAdminTools() {
  const [resetDatabase] = useMutation(RESET_DATABASE_MUTATION, {
		update: (cache) => {
			cache.writeQuery({
        query: GET_ALL_NOTES_QUERY,
        data: { notes: [] },
      });
		}
	});

  return {
    resetDatabase,
  };
}

export default useAdminTools;
