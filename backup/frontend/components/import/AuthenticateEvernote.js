import { useMutation } from '@apollo/react-hooks';
import React, { useEffect } from 'react';
import compose from 'recompose/compose';
import pure from 'recompose/pure';
import styled from 'styled-components';
import { withRouter } from 'next/router';
import PropTypes from 'prop-types';

import { withApollo } from '../../lib/apollo';
import Button from '../common/Button';
import { IS_EVERNOTE_AUTHENTICATED_QUERY } from '../../lib/apollo/queries/evernote';
import { AUTHENTICATE_EVERNOTE_MUTATION } from '../../lib/apollo/mutations/evernote';

const AuthenticateEvernote = ({ router }) => {
	// eslint-disable-next-line camelcase
	const { query: { oauth_verifier } } = router;
	const [ authenticate ] = useMutation(AUTHENTICATE_EVERNOTE_MUTATION);
	const onAuthenticate = (e) => {
		e.preventDefault();
		authenticate({
			update: (cache, { data }) => {
				const { authURL } = data.authenticate;

				if (authURL) {
					window.open(authURL, '_self');
				}
			},
		});
	};

	// handle evernote auth response
	useEffect(() => {
		// eslint-disable-next-line camelcase
		if (oauth_verifier) {
			authenticate({
				refetchQueries: [ { query: IS_EVERNOTE_AUTHENTICATED_QUERY } ], // TODO do i actually need this?
				update: () => {
					// TODO consider updating the cache directly instead of refetching
					// update url
					router.replace('/import', '/import', { shallow: true });
				},
				variables: { oauthVerifier: oauth_verifier },
			});
		}
		// eslint-disable-next-line camelcase
	}, [ oauth_verifier ]);

	return (
		<AuthButton
			label="Authenticate Evernote"
			onClick={ (e) => onAuthenticate(e) }
			type="button"
		/>
	);
};

AuthenticateEvernote.propTypes = {
	router: PropTypes.shape({
		query: PropTypes.shape({
			oauth_token: PropTypes.string,
			oauth_verifier: PropTypes.string,
		}),
		replace: PropTypes.func,
	}).isRequired,
};

AuthenticateEvernote.whyDidYouRender = true;

const enhance = compose(
	pure,
	withRouter,
);

export default withApollo({ ssr: true })(enhance(AuthenticateEvernote));

const AuthButton = styled(Button)`
  cursor: pointer;
  border: 0;
  color: white;
  background: ${ (props) => props.theme.altGreen };
  border-radius: 5px;
  padding: 6px 10px;
  font-size: 16px;
  font-weight: 600;
  margin: 0 10px 10px;

	&:first-of-type {
		margin-left: 0;
	}
`;
