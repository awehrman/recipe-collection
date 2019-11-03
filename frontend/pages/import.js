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
import Loading from '../components/Loading';
import ParsedViewer from '../components/recipes/ParsedViewer';
import { GET_NOTES_COUNT_QUERY, GET_ALL_NOTES_QUERY, IS_EVERNOTE_AUTHENTICATED_QUERY } from '../lib/apollo/queries';
import { CREATE_RECIPE_MUTATION, IMPORT_NOTES_MUTATION, PARSE_NOTES_MUTATION } from '../lib/apollo/mutations';

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
	importNotes: ({ render }) => (
		<Mutation
			refetchQueries={ [
				{ query: GET_ALL_NOTES_QUERY },
				{ query: GET_NOTES_COUNT_QUERY },
			] }
			mutation={ IMPORT_NOTES_MUTATION }
		>
			{ render }
		</Mutation>
	),

	// eslint-disable-next-line react/prop-types
	parseNotes: ({ render }) => (
		<Mutation mutation={ PARSE_NOTES_MUTATION }>
			{ render }
		</Mutation>
	),

	// eslint-disable-next-line react/prop-types
	createRecipe: ({ render }) => (
		<Mutation mutation={ CREATE_RECIPE_MUTATION }>
			{ render }
		</Mutation>
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
`;

const NotesViewer = styled.div`
	margin: 20px 0;
	max-width: 950px;
`;

const Note = styled.div`
	background: #E8F6F3;
	border-radius: 5px;
	margin-bottom: 20px;
	padding: 40px 60px;

	h1 {
		font-weight: 100;
		font-size: 18px;
		margin: 0 0 20px;
	}
`;

class Import extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			isParsing: false,
			parsedNotes: [],
		};
	}

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

	parseNotes = (e) => {
		e.preventDefault();
		const { client } = this.props;
		this.setState({ isParsing: true }, () => {
			// TODO instead of refetching these queries, we could just update the cache manually with the response
			client.mutate({
				refetchQueries: [
					{ query: GET_ALL_NOTES_QUERY },
					{ query: GET_NOTES_COUNT_QUERY },
				],
				mutation: PARSE_NOTES_MUTATION,
				update: () => this.setState({ isParsing: false }),
			});
		});
	}

	saveRecipe = (e) => {
		e.preventDefault();

		// TODO go through parsed notes and issue a create mutate for each
		/* client.mutate({
			mutation: CREATE_RECIPE_MUTATION,
			data,
		})
		*/
	}

	render() {
		const { isParsing, parsedNotes } = this.state;
		return (
			<ImportStyles>
				<Header pageHeader="Import" />
				<Composed>
					{
						({
							isEvernoteAuthenticated,
							getNotes,
							getNotesCount,
							importNotes,
						}) => {
							const { error, data } = isEvernoteAuthenticated;
							if (error) return <ErrorMessage error={ error } />;
							const isAuthenticated = (data) ? Boolean(data.isEvernoteAuthenticated) : false;
							const { count } = (getNotesCount && getNotesCount.data)
								? getNotesCount.data.noteAggregate
								: 0;
							const { notes = [] } = (getNotes && getNotes.data) ? getNotes.data : {};

							return (
								<section>
									<ActionBar>
										{/* Authenticate Evernote */}
										{
											(!isAuthenticated)
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
														onClick={ importNotes }
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
											(isAuthenticated && parsedNotes && (parsedNotes.length > 0))
												? (
													<Button
														label="Save Recipes"
														onClick={ (e) => this.saveRecipes(e) }
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
															{
																(isParsing)
																	? <Loading />
																	: null
															}
															{
																(n.ingredients || n.instructions)
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
