import axios from 'axios';
import { withRouter } from 'next/router';
import React from 'react';
import { adopt } from 'react-adopt';
import { Mutation, withApollo } from 'react-apollo';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import Button from '../components/form/Button';
import Header from '../components/Header';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';
import { GET_NOTES_QUERY, GET_EVERNOTE_AUTH_TOKEN_QUERY } from '../lib/apollo/queries';
import { PARSE_NOTES_MUTATION } from '../lib/apollo/mutations';

import { hasProperty } from '../lib/util';

const Composed = adopt({
	// eslint-disable-next-line react/prop-types
	parseNotes: ({ render }) => (
		<Mutation mutation={ PARSE_NOTES_MUTATION }>
			{ render }
		</Mutation>
	),
});

const ImportStyles = styled.article`
`;

class Import extends React.PureComponent {
	componentDidMount() {
		console.warn('componentDidMount');

		const { client, router, query } = this.props;

		if (hasProperty(query, 'oauth_token') && hasProperty(query, 'oauth_verifier')) {
			// eslint-disable-next-line camelcase
			const { oauth_token, oauth_verifier } = query;
			// eslint-disable-next-line
			console.log({ oauth_token, oauth_verifier });
			// go back to our server with our verifier string to receive our actual access token
			// eslint-disable-next-line camelcase
			const url = `http://localhost:3001/evernote/auth?oauthVerifier=${ oauth_verifier }`;
			console.log({ url });
			axios(url, { withCredentials: true })
				.then(({ data }) => {
					const { evernoteAuthToken } = data;
					console.warn({ evernoteAuthToken });
					if (evernoteAuthToken) {
						client.writeQuery({
							data: { evernoteAuthToken },
							query: GET_EVERNOTE_AUTH_TOKEN_QUERY,
						});
						router.replace('/import', '/import', { shallow: true });
					}
				}).catch((err) => {
					console.error(err);
				});
		} else {
			// kick off the authentication process
			console.log('authenticating...');
			this.authenticate();
		}
	}
	authenticate = () => {
		const { client } = this.props;
		let token;
		try {
			token = client.readQuery({ query: GET_EVERNOTE_AUTH_TOKEN_QUERY });
			console.log(token);
		} catch (err) {
			// not in the cache yet
			console.warn('refetch token!');
		}

		if (!token) {
			// request the temporary requestToken with our callback from evernote
			axios('http://localhost:3001/evernote/auth', { withCredentials: true }).then(({ data }) => {
				const { evernoteAuthToken, tokenLink } = data;
				// redirect us to evernote to sign in
				if (tokenLink) {
					window.open(tokenLink, '_self');
				}

				// if we already had a token in our session, just save this to the cache
				if (evernoteAuthToken) {
					client.writeQuery({
						data: { evernoteAuthToken },
						query: GET_EVERNOTE_AUTH_TOKEN_QUERY,
					});
				}
			}).catch((err) => {
				console.error(err);
			});
		}
	}

	getNotes = () => {
		console.warn('getNotes');
		const { client } = this.props;
		client.query({ query: GET_NOTES_QUERY });
	}


	render() {
		return (
			<ImportStyles>
				<Header pageHeader="Import" />
				<section>
					<Composed>
						{
							({ parseNotes }) => {
								const { error, loading } = parseNotes;
								// eslint-disable-next-line
								if (error) return <ErrorMessage error={ error } />;
								if (loading) return <Loading />;

								return (
									<>
										<div>

										</div>
									</>
								);
							}
						}
					</Composed>
				</section>
			</ImportStyles>
		);
	}
}

Import.defaultProps = { query: null };

Import.propTypes = {
	client: PropTypes.shape({
		readQuery: PropTypes.func,
		query: PropTypes.func,
	}).isRequired,
	query: PropTypes.shape({
		oauth_token: PropTypes.string,
		oauth_verifier: PropTypes.string,
	}),
};


export default withRouter(withApollo(Import));
