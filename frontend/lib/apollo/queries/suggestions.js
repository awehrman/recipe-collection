import { gql } from '@apollo/client';

export const GET_SUGGESTED_CATEGORIES_QUERY = gql`
	query GET_SUGGESTED_CATEGORIES_QUERY(
		$type: String
		$value: String
	) {
		suggestions(
			type: $type
			value: $value
		) @client {
			id
			name
		}
	}
`;


export const GET_SUGGESTED_INGREDIENTS_QUERY = gql`
	query GET_SUGGESTED_INGREDIENTS_QUERY(
		$type: String
		$value: String
	) {
		suggestions(
			type: $type
			value: $value
		) @client {
			id
			name
		}
	}
`;

export const GET_SUGGESTED_TAGS_QUERY = gql`
	query GET_SUGGESTED_TAGS_QUERY(
		$type: String
		$value: String
	) {
		suggestions(
			type: $type
			value: $value
		) @client {
			id
			name
		}
	}
`;

export default {
	GET_SUGGESTED_CATEGORIES_QUERY,
	GET_SUGGESTED_INGREDIENTS_QUERY,
	GET_SUGGESTED_TAGS_QUERY,
};
