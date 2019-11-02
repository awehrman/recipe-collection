import axios from 'axios';
import { withRouter } from 'next/router';
import React from 'react';
import { adopt } from 'react-adopt';
import { Mutation, Query, withApollo } from 'react-apollo';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import Button from '../components/form/Button';
import Header from '../components/Header';
import ErrorMessage from '../components/ErrorMessage';
import { GET_NOTES_QUERY, IS_EVERNOTE_AUTHENTICATED_QUERY } from '../lib/apollo/queries';
import { PARSE_NOTES_MUTATION } from '../lib/apollo/mutations';

import { hasProperty } from '../lib/util';

const Composed = adopt({
	// eslint-disable-next-line react/prop-types
	isEvernoteAuthenticated: ({ render }) => (
		<Query query={ IS_EVERNOTE_AUTHENTICATED_QUERY } ssr={ false }>
			{ render }
		</Query>
	),

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
		const { client, router, query } = this.props;

		if (hasProperty(query, 'oauth_token') && hasProperty(query, 'oauth_verifier')) {
			console.log('passing back to server to finalize auth!');
			// eslint-disable-next-line camelcase
			const { oauth_token, oauth_verifier } = query;

			// go back to our server with our verifier string to receive our actual access token
			// eslint-disable-next-line camelcase
			const url = `http://localhost:3001/evernote/auth?oauthVerifier=${ oauth_verifier }`;
			axios(url, { withCredentials: true })
				.then((data) => {
					// update our auth status
					client.writeQuery({
						data: { isEvernoteAuthenticated: true },
						query: IS_EVERNOTE_AUTHENTICATED_QUERY,
					});

					// update url
					router.replace('/import', '/import', { shallow: true });
				})
				.catch((err) => console.error(err));
		}
	}

	authenticate = () => {
		console.warn('authenticate');
		const { client } = this.props;

		console.log('requesting token...');
		// request the temporary requestToken with our callback from evernote
		axios('http://localhost:3001/evernote/auth', { withCredentials: true }).then(({ data }) => {
			const { authURL, isAuthenticated } = data;
			// redirect us to evernote to sign in
			if (authURL) {
				window.open(authURL, '_self');
			}

			if (isAuthenticated) {
				client.writeQuery({
					data: { isEvernoteAuthenticated: true },
					query: IS_EVERNOTE_AUTHENTICATED_QUERY,
				});
			}
		}).catch((err) => {
			console.error(err);
		});
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
							({ isEvernoteAuthenticated, parseNotes }) => {
								const { error, data } = isEvernoteAuthenticated;
								if (error) return <ErrorMessage error={ error } />;
								const isAuthenticated = (data) ? Boolean(data.isEvernoteAuthenticated) : false;
								console.log({ isAuthenticated });

								return (
									<>
										<div>
											{
												(!isAuthenticated)
													? (
														<Button
															type="button"
															label="Authenticate Evernote"
															onClick={ this.authenticate }
														/>
													)
													: (
														<>
															<Button
																	type = "button"
																	label = "Get Notes"
																	onClick = { this.getNotes }
															/>
															<Button
																type="button"
																label="Parse Notes"
																onClick={ parseNotes }
															/>
														</>
													)
											}
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
