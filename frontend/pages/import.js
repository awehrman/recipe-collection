import { withRouter } from 'next/router';
import React from 'react';
import { adopt } from 'react-adopt';
import { Query, withApollo } from 'react-apollo';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import Button from '../components/form/Button';
import Header from '../components/Header';
import ErrorMessage from '../components/ErrorMessage';
// import Loading from '../components/Loading';
// import ParsedViewer from '../components/recipes/ParsedViewer';
/* eslint-disable object-curly-newline */
import {
	GET_NOTES_COUNT_QUERY,
	GET_ALL_NOTES_QUERY,
	IS_EVERNOTE_AUTHENTICATED_QUERY,
} from '../lib/apollo/queries';
import {
	IMPORT_NOTES_MUTATION,
	PARSE_NOTES_MUTATION,
	AUTHENTICATE_EVERNOTE_MUTATION,
	CONVERT_NOTES_MUTATION,
} from '../lib/apollo/mutations';
/* eslint-enable object-curly-newline */

import { hasProperty } from '../lib/util';

const Composed = adopt({
	// eslint-disable-next-line react/prop-types
	authentication: ({ render }) => (
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
});

const ImportStyles = styled.article`
	button {
		cursor: pointer;
		border: 0;
		color: white;
		background: ${ (props) => props.theme.altGreen };
		border-radius: 5px;
		padding: 6px 10px;
		font-size: 16px;
		font-weight: 600;
		margin: 0 10px 10px;
	}
`;

const ActionBar = styled.div`
	button:first-of-type {
		margin-left: 0;
	}
`;

const NotesViewer = styled.div`
	margin: 20px 0;
	max-width: 850px;
`;

const Note = styled.div`
	background: ${ (props) => props.theme.headerBackground };
	padding: 10px;
	margin-bottom: 8px;

	h1 {
		font-weight: 100;
		font-size: 16px;
		margin: 0;
		padding: 0;
	}

`;

class Import extends React.PureComponent {
	componentDidMount() {
		const { client, router, query } = this.props;

		if (hasProperty(query, 'oauth_token') && hasProperty(query, 'oauth_verifier')) {
			// eslint-disable-next-line camelcase
			const { oauth_verifier } = query;

			// go back to our server with our verifier string to receive our actual access token
			client.mutate({
				refetchQueries: [ { query: IS_EVERNOTE_AUTHENTICATED_QUERY } ],
				mutation: AUTHENTICATE_EVERNOTE_MUTATION,
				update: () => {
					// TODO consider updating the cache directly instead of refetching
					// update url
					router.replace('/import', '/import', { shallow: true });
				},
				variables: { oauthVerifier: oauth_verifier },
			});
		}
	}

	authenticate = () => {
		const { client } = this.props;

		// call the authentication mutation to receive the request token
		client.mutate({
			mutation: AUTHENTICATE_EVERNOTE_MUTATION,
			update: (cache, { data }) => {
				const { authenticate } = data;
				const { authURL } = authenticate;

				if (authURL) {
					window.open(authURL, '_self');
				}
			},
		});
	}

	convertNotes = (e) => {
		e.preventDefault();
		const { client } = this.props;
		client.mutate({
			refetchQueries: [
				{ query: GET_NOTES_COUNT_QUERY },
			],
			mutation: CONVERT_NOTES_MUTATION,
			update: (cache, { data }) => {
				const { convertNotes } = data;
				const { errors } = convertNotes;
				// TODO handle errors
				if (errors && (errors.length > 0)) {
					console.error({ errors });
				}

				cache.writeQuery({
					query: GET_ALL_NOTES_QUERY,
					data: { notes: [] },
				});
			},
		});
	}

	importNotes = async (e, importDefault = 0) => {
		console.warn('importNotes');
		console.log({ importDefault });
		e.preventDefault();
		const { client } = this.props;

		await client.mutate({
			refetchQueries: [
				{ query: GET_NOTES_COUNT_QUERY },
			],
			mutation: IMPORT_NOTES_MUTATION,
			optimisticResponse: {
				__typename: 'Mutation',
				importNotes: {
					__typename: 'EvernoteResponse',
					errors: [],
					notes: new Array(importDefault).fill(0).map((_, index) => ({
						__typename: 'Note',
						id: `-1_${ index }`,
						title: 'Loading Note...',
						ingredients: [],
						instructions: [],
					})),
				},
			},
			update: (cache, { data }) => {
				const { importNotes } = data;
				const { errors } = importNotes;
				if (errors && (errors.length > 0)) {
					console.error({ errors });
				}
				const { notes } = cache.readQuery({ query: GET_ALL_NOTES_QUERY });
				const updated = { notes: notes.concat([ importNotes.notes ]).flat() };

				cache.writeQuery({
					query: GET_ALL_NOTES_QUERY,
					data: updated,
				});
			},
		});
	}

	parseNotes = (e) => {
		e.preventDefault();
		const { client } = this.props;
		// TODO instead of refetching these queries, we could just update the cache manually with the response
		client.mutate({
			refetchQueries: [
				{ query: GET_NOTES_COUNT_QUERY },
			],
			mutation: PARSE_NOTES_MUTATION,
			update: (cache, { data }) => {
				const { parseNotes } = data;
				const { errors } = parseNotes;
				// TODO handle errors
				if (errors && (errors.length > 0)) {
					console.error({ errors });
				}
				const { notes } = parseNotes;
				console.warn({ notes });
				cache.writeQuery({
					query: GET_ALL_NOTES_QUERY,
					data: { notes },
				});
			},
		});
	}

	render() {
		return (
			<ImportStyles>
				<Header pageHeader="Import" />
				<Composed>
					{
						({
							authentication,
							getNotes,
							getNotesCount,
						}) => {
							const { error, data } = authentication;
							if (error) return <ErrorMessage error={ error } />;
							const { isAuthenticated = false } = (data && data.isEvernoteAuthenticated) ? data.isEvernoteAuthenticated : {};
							const { isAuthenticationPending = false } = (data && data.isEvernoteAuthenticated) ? data.isEvernoteAuthenticated : {};
							const { count, importDefault } = (getNotesCount && getNotesCount.data)
								? getNotesCount.data.noteAggregate
								: 0;
							console.log({ count, importDefault, getNotesCount });
							const { notes = [] } = (getNotes && getNotes.data) ? getNotes.data : {};

							return (
								<section>
									<ActionBar>
										{/* Authenticate Evernote */}
										{
											(!isAuthenticated && !isAuthenticationPending)
												? (
													<Button
														label="Authenticate Evernote"
														onClick={ this.authenticate }
														type="button"
													/>
												) : null
										}

										{/* Import Notes from Evernote */}
										{
											(isAuthenticated)
												? (
													<Button
														label="Import Notes"
														onClick={ (e) => this.importNotes(e, importDefault) }
														type="button"
													/>
												) : null
										}

										{/* Parse Notes */}
										{/* TODO update with count of just unparsed notes */
											(isAuthenticated && (count > 0))
												? (
													<Button
														label={ `Parse ${ count } Note${ (count === 1) ? '' : 's' }` }
														onClick={ (e) => this.parseNotes(e) }
														type="button"
													/>
												) : null
										}

										{/* Save Recipes */}
										{
											(isAuthenticated && (count > 0))
												? (
													<Button
														label="Save Recipes"
														onClick={ (e) => this.convertNotes(e) }
														type="button"
													/>
												) : null
										}
									</ActionBar>
									<NotesViewer>
										{
											(notes)
												? (
													notes.map((n, index) => (
														// eslint-disable-next-line
														<Note key={ `${ index }_${ n.id }` }>
															<h1>{ n.title }</h1>
															{/*
																(n.ingredients || n.instructions)
																	? (
																		<ParsedViewer
																			className="left"
																			id={ n.id }
																			ingredients={ n.ingredients }
																			instructions={ n.instructions }
																		/>
																	) : null
															*/}
														</Note>
													))
												)
												: null
										}
									</NotesViewer>
								</section>
							);
						}
					}
				</Composed>
			</ImportStyles>
		);
	}
}

Import.defaultProps = { query: null };

Import.propTypes = {
	client: PropTypes.shape({
		cache: PropTypes.shape({
			readQuery: PropTypes.func,
			writeQuery: PropTypes.func,
		}),
		mutate: PropTypes.func,
		query: PropTypes.func,
	}).isRequired,
	router: PropTypes.shape({ replace: PropTypes.func }).isRequired,
	query: PropTypes.shape({
		oauth_token: PropTypes.string,
		oauth_verifier: PropTypes.string,
	}),
};


export default withRouter(withApollo(Import));
