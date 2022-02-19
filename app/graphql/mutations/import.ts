import { gql } from '@apollo/client';

export const IMPORT_LOCAL_MUTATION = gql`
	mutation IMPORT_LOCAL_MUTATION {
		importLocal {
			id
			errorMessage
		}
	}
`;

export default {
	IMPORT_LOCAL_MUTATION,
};
