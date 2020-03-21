import { gql } from '@apollo/client';
import { ALL_CONTAINER_FIELDS } from '../fragments/containers';

export const GET_CONTAINER_QUERY = gql`
	query GET_CONTAINER_QUERY($id: String!) {
		container(id: $id) @client {
			...ContainerFields
		}
	}
	${ ALL_CONTAINER_FIELDS }
`;

export const GET_ALL_CONTAINERS_QUERY = gql`
	query GET_ALL_CONTAINERS_QUERY($group: String, $view: String) {
		containers(group: $group, view: $view) @client {
			...ContainerFields
		}
	}
	${ ALL_CONTAINER_FIELDS }
`;

export default {
	GET_ALL_CONTAINERS_QUERY,
	GET_CONTAINER_QUERY,
};
