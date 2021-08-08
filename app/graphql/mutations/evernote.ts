import { gql } from '@apollo/client';

// TODO we might not even need to transfer the oauthVerifier here if we store that on our user too
export const AUTHENTICATE_EVERNOTE_MUTATION = gql`
	mutation AUTHENTICATE_EVERNOTE_MUTATION($oauthVerifier: String) {
		authenticateEvernote(oauthVerifier: $oauthVerifier) {
			id
			authURL
			errorMessage
			isAuthPending
			isAuthenticated
		}
	}
`;

export const CLEAR_EVERNOTE_AUTH_MUTATION = gql`
	mutation CLEAR_EVERNOTE_AUTH_MUTATION {
		clearAuthentication {
			errorMessage
			isAuthPending
			isAuthenticated
		}
	}
`;

export default {
	AUTHENTICATE_EVERNOTE_MUTATION,
	CLEAR_EVERNOTE_AUTH_MUTATION,
};
