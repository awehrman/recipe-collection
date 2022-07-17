import { gql } from '@apollo/client';

export const TOGGLE_CONTAINER_MUTATION = gql`
	mutation TOGGLE_CONTAINER_MUTATION($id: String) {
		toggleContainer(id: $id) {
			id
		}
	}
`;


export default {
	TOGGLE_CONTAINER_MUTATION,
};
