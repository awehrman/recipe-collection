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
import { GET_NOTES_COUNT_QUERY, GET_ALL_NOTES_QUERY, IS_EVERNOTE_AUTHENTICATED_QUERY } from '../lib/apollo/queries';
import { IMPORT_NOTES_MUTATION, PARSE_NOTES_MUTATION } from '../lib/apollo/mutations';

import { hasProperty } from '../lib/util';

const Composed = adopt({
	// eslint-disable-next-line react/prop-types
	isEvernoteAuthenticated: ({ render }) => (
		<Query query={ IS_EVERNOTE_AUTHENTICATED_QUERY } ssr={ false }>
			{ render }
		</Query>
	),

	// eslint-disable-next-line react/prop-types
	getNotes: ({ render }) => (
		<Query query={ GET_ALL_NOTES_QUERY } ssr={ false }>
			{ render }
		</Query>
	),

	// eslint-disable-next-line react/prop-types
	getNotesCount: ({ render }) => (
		<Query query={ GET_NOTES_COUNT_QUERY } ssr={ false }>
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
			// eslint-disable-next-line camelcase
			const { oauth_verifier } = query;

			// go back to our server with our verifier string to receive our actual access token
			// eslint-disable-next-line camelcase
			const url = `${ process.env.EVERNOTE_AUTH_URL }?oauthVerifier=${ oauth_verifier }`;
			axios(url, { withCredentials: true })
				.then(() => {
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
		const { client } = this.props;

		// request the temporary requestToken with our callback from evernote
		axios(process.env.EVERNOTE_AUTH_URL, { withCredentials: true }).then(({ data }) => {
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
		client.mutate({
			refetchQueries: [
				{ query: GET_NOTES_COUNT_QUERY },
				{ query: GET_ALL_NOTES_QUERY },
			],
			mutation: IMPORT_NOTES_MUTATION,
		});
	}

	render() {
		return (
			<ImportStyles>
				<Header pageHeader="Import" />
				<section>
					<Composed>
						{
							({ isEvernoteAuthenticated, getNotes, getNotesCount, parseNotes }) => {
								const { error, data } = isEvernoteAuthenticated;
								if (error) return <ErrorMessage error={ error } />;
								const isAuthenticated = (data) ? Boolean(data.isEvernoteAuthenticated) : false;
								const { count } = (getNotesCount && getNotesCount.data)
									? getNotesCount.data.noteAggregate
									: 0;
								const { notes = [] } = (getNotes && getNotes.data) ? getNotes.data : {};
								return (
									<>
										<div className="sub-header">
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
																type="button"
																label="Get Notes"
																onClick={ this.getNotes }
															/>
															{
																(count > 0)
																	? (
																		<Button
																			type="button"
																			label={ `Parse ${ count } Notes` }
																			onClick={ parseNotes }
																		/>
																	)
																	: null
															}
														</>
													)
											}
										</div>
										<div className="notes">
											{
												(notes)
													? (
														<ul>
															{
																notes.map((n) => (
																	<li key={ n.id }>
																		{ n.title }
																		<div className="content">
																			{ n.content }
																		</div>
																	</li>
																))
															}
														</ul>
													)
													: null
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
		mutate: PropTypes.func,
		writeQuery: PropTypes.func,
	}).isRequired,
	router: PropTypes.shape({ replace: PropTypes.func }).isRequired,
	query: PropTypes.shape({
		oauth_token: PropTypes.string,
		oauth_verifier: PropTypes.string,
	}),
};


export default withRouter(withApollo(Import));
