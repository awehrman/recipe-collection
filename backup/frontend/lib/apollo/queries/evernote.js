import { gql } from '@apollo/client';

export const IS_EVERNOTE_AUTHENTICATED_QUERY = gql`
  query IS_EVERNOTE_AUTHENTICATED_QUERY {
  	isEvernoteAuthenticated {
  		errors
			isAuthenticationPending
			isAuthenticated
  	}
  }
`;

export default {
	IS_EVERNOTE_AUTHENTICATED_QUERY,
};
