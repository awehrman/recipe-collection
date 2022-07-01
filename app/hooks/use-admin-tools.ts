import { gql, useMutation } from '@apollo/client';


export const RESET_DATABASE_MUTATION = gql`
	mutation RESET_DATABASE_MUTATION {
		resetDatabase {
			error
		}
	}
`;

function useAdminTools() {
  const [resetDatabase] = useMutation(RESET_DATABASE_MUTATION);

  return {
    resetDatabase,
  };
}

export default useAdminTools;
