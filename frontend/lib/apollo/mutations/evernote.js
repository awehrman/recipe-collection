import { gql } from '@apollo/client';

export const AUTHENTICATE_EVERNOTE_MUTATION = gql`
	mutation AUTHENTICATE_EVERNOTE_MUTATION($oauthVerifier: String, $token: String) {
		authenticate(oauthVerifier: $oauthVerifier, token: $token) {
			authURL
			errors
			isAuthenticationPending
			isAuthenticated
		}
	}
`;

export const CLEAR_EVERNOTE_AUTH_MUTATION = gql`
	mutation CLEAR_EVERNOTE_AUTH_MUTATION {
		clearAuthentication {
			errors
			isAuthenticationPending
			isAuthenticated
		}
	}
`;

export default {
	AUTHENTICATE_EVERNOTE_MUTATION,
	CLEAR_EVERNOTE_AUTH_MUTATION,
};
