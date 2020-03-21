import { gql } from '@apollo/client';

export const GET_ALL_CATEGORIES_QUERY = gql`
  query GET_ALL_CATEGORIES_QUERY {
  	categories {
  		id
			evernoteGUID
			name
		}
  }
`;

export default {
	GET_ALL_CATEGORIES_QUERY,
};
