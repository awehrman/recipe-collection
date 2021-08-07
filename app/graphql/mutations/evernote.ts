import { gql } from '@apollo/client';

export const AUTHENTICATE_EVERNOTE_MUTATION = gql`
	mutation AUTHENTICATE_EVERNOTE_MUTATION($oauthVerifier: String, $userId: Int!) {
		authenticateEvernote(oauthVerifier: $oauthVerifier, userId: $userId) {
			id
			authURL
			errors
			isAuthPending
			isAuthenticated
		}
	}
`;

export const CLEAR_EVERNOTE_AUTH_MUTATION = gql`
	mutation CLEAR_EVERNOTE_AUTH_MUTATION {
		clearAuthentication {
			errors
			isAuthPending
			isAuthenticated
		}
	}
`;

export default {
	AUTHENTICATE_EVERNOTE_MUTATION,
	CLEAR_EVERNOTE_AUTH_MUTATION,
};
