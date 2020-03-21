import { gql } from '@apollo/client';

export const GET_ALL_TAGS_QUERY = gql`
  query GET_ALL_TAGS_QUERY {
  	tags {
  		id
			evernoteGUID
			name
		}
  }
`;

export default {
	GET_ALL_TAGS_QUERY,
};
