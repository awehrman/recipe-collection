import { useMutation, useQuery } from '@apollo/client';
import { withRouter } from 'next/router';
import { compose, withHandlers, lifecycle, withProps } from 'recompose';
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import SyntaxHighlighter from 'react-syntax-highlighter';
import pretty from 'pretty';

import { dark } from '../styles/dark';
import Button from '../components/common/Button';
import Header from '../components/Header';
import ParsedViewer from '../components/recipes/ParsedViewer';
import { IS_EVERNOTE_AUTHENTICATED_QUERY } from '../lib/apollo/queries/evernote';
import { GET_NOTES_COUNT_QUERY, GET_ALL_NOTES_QUERY } from '../lib/apollo/queries/notes';
// import { IMPORT_NOTES_MUTATION, PARSE_NOTES_MUTATION, CONVERT_NOTES_MUTATION } from '../lib/apollo/mutations/notes';
import { AUTHENTICATE_EVERNOTE_MUTATION } from '../lib/apollo/mutations/evernote';
import { hasProperty } from '../lib/util';

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

const Content = styled.div`
	overflow-y: auto !important;
	overflow-x: auto !important;
	max-height: 250px;
	display: 'flex';
	font-size: 10px;
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

const Import = ({ authenticate }) => {
	const onAuthenticate = (e) => {
		console.log('onAuthenticate');
		e.preventDefault();
		// call the authentication mutation to receive the request token
		authenticate({
			update: (cache, { data }) => {
				const { authURL } = data.authenticate;

				if (authURL) {
					window.open(authURL, '_self');
				}
			},
		});
	};

	const convertNotes = (e) => {
		e.preventDefault();
		/* TODO useMutation
		client.mutate({
			refetchQueries: [
				{ query: GET_NOTES_COUNT_QUERY },
			],
			mutation: CONVERT_NOTES_MUTATION,
			update: (cache, { data }) => {
				const { errors } = data.convertNotes;
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
		*/
	};

	const importNotes = async (e) => {
		e.preventDefault();

		/* TODO useMutation
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
						content: null,
						title: 'Loading Note...',
						ingredients: [],
						instructions: [],
					})),
				},
			},
			update: (cache, { data }) => {
				const { errors } = data.importNotes;
				if (errors && (errors.length > 0)) {
					console.error({ errors });
				}
				const { notes } = cache.readQuery({ query: GET_ALL_NOTES_QUERY });
				const updated = {
					notes: notes
						.concat([ data.importNotes.notes ])
						.flat(),
				};

				cache.writeQuery({
					query: GET_ALL_NOTES_QUERY,
					data: updated,
				});
			},
		});
		*/
	};

	const parseNotes = (e) => {
		e.preventDefault();
		// TODO instead of refetching these queries, we could just update the cache manually with the response
		/*
		client.mutate({
			refetchQueries: [
				{ query: GET_NOTES_COUNT_QUERY },
			],
			mutation: PARSE_NOTES_MUTATION,
			update: (cache, { data }) => {
				const { errors } = data.parseNotes;
				// TODO handle errors
				if (errors && (errors.length > 0)) {
					console.error({ errors });
				}
				const { notes } = parseNotes;
				cache.writeQuery({
					query: GET_ALL_NOTES_QUERY,
					data: { notes },
				});
			},
		});
		*/
	};

	// fetch authenticated status
	const {
		data,
		// loading,
		// error,
	} = useQuery(IS_EVERNOTE_AUTHENTICATED_QUERY);

	// TODO combine the note data and count into the same request
	// fetch notes
	const {
		data: notesData,
		// loading: notesLoading,
		// error: notesError,
	} = useQuery(GET_ALL_NOTES_QUERY);

	// fetch note count
	const {
		data: countData,
		// loading: countLoading,
		// error: countError,
	} = useQuery(GET_NOTES_COUNT_QUERY);

	const { isAuthenticated = false } = (data && data.isEvernoteAuthenticated) ? data.isEvernoteAuthenticated : {};
	const { isAuthenticationPending = false } = (data && data.isEvernoteAuthenticated) ? data.isEvernoteAuthenticated : {};
	const { count, importDefault } = countData
		? countData.noteAggregate
		: 0;
	const { notes = [] } = notesData || {};
	// console.log({ data, isAuthenticated, isAuthenticationPending });

	return (
		<ImportStyles>
			<Header pageHeader="Import" />
			<section>
				<ActionBar>
					{/* Authenticate Evernote */}
					{
						(!isAuthenticated && !isAuthenticationPending)
							? (
								<Button
									label="Authenticate Evernote"
									onClick={ (e) => onAuthenticate(e) }
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
									onClick={ (e) => importNotes(e, importDefault) }
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
									onClick={ (e) => parseNotes(e) }
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
									onClick={ (e) => convertNotes(e) }
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
										<h1>{n.title}</h1>
										{
											(n.content && (n.ingredients.length === 0))
												? (
													<Content>
														<SyntaxHighlighter
															className="highlighter"
															language="html"
															wrapLines
															style={ dark }
														>
															{ pretty(n.content) }
														</SyntaxHighlighter>
													</Content>
												) : null
										}
										{
											((n.ingredients.length > 0) || (n.instructions.length > 0))
												? (
													<ParsedViewer
														className="left"
														id={ n.id }
														ingredients={ n.ingredients }
														instructions={ n.instructions }
													/>
												) : null
										}
									</Note>
								))
							)
							: null
					}
				</NotesViewer>
			</section>
		</ImportStyles>
	);
};

Import.propTypes = {
	authenticate: PropTypes.func.isRequired,
	router: PropTypes.shape({
		query: PropTypes.shape({
			oauth_token: PropTypes.string,
			oauth_verifier: PropTypes.string,
		}),
		replace: PropTypes.func,
	}).isRequired,
};

const enhance = compose(
	withRouter,
	withProps(() => {
		const [ authenticate ] = useMutation(AUTHENTICATE_EVERNOTE_MUTATION);
		return { authenticate };
	}),
	withHandlers({
		// eslint-disable-next-line camelcase
		handleAuthentication: ({ authenticate, router }) => ({ oauth_verifier }) => {
			console.log('handleAuthentication', oauth_verifier);

			authenticate({
				refetchQueries: [ { query: IS_EVERNOTE_AUTHENTICATED_QUERY } ],
				update: () => {
					console.log('update...');
					// TODO consider updating the cache directly instead of refetching
					// update url
					router.replace('/import', '/import', { shallow: true });
				},
				variables: { oauthVerifier: oauth_verifier },
			});
		},
	}),
	lifecycle({
		componentDidMount() {
			console.log('componentDidMount');
			const { handleAuthentication, router } = this.props;
			const { query } = router;

			if (hasProperty(query, 'oauth_token') && hasProperty(query, 'oauth_verifier')) {
				// go back to our server with our verifier string to receive our actual access token
				// eslint-disable-next-line camelcase
				const { oauth_verifier } = query;
				handleAuthentication({ oauth_verifier });
			}
		},
	}),
);

export default withRouter(enhance(Import));
