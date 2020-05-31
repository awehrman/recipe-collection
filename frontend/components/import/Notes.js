import { useQuery, useMutation } from '@apollo/react-hooks';
import React from 'react';
import styled from 'styled-components';
import pure from 'recompose/pure';
import PropTypes from 'prop-types';

import useEvernote from './useEvernote';
import Button from '../common/Button';
import NotesGrid from './NotesGrid';
import AuthenticateEvernote from './AuthenticateEvernote';

import { withApollo } from '../../lib/apollo';
import { GET_ALL_NOTES_QUERY } from '../../lib/apollo/queries/notes';
import { CONVERT_NOTES_MUTATION, IMPORT_NOTES_MUTATION, PARSE_NOTES_MUTATION } from '../../lib/apollo/mutations/notes';

const Notes = ({ isAuthenticated, isAuthenticationPending }) => {
	const [ importMutation ] = useMutation(IMPORT_NOTES_MUTATION);
	const [ parseNotesMutation ] = useMutation(PARSE_NOTES_MUTATION);
	const [ saveMutation ] = useMutation(CONVERT_NOTES_MUTATION);

	const {
		convertNotes,
		importNotes,
		remaining,
		saveRecipes,
	} = useEvernote({ importMutation });
	const { data, loading } = useQuery(GET_ALL_NOTES_QUERY, { fetchPolicy: 'network-only' });
	const { notes = [] } = data || {};
	const converted = notes.filter((n) => (n.ingredients && n.ingredients.length) || (n.instructions && n.instructions.length));
	const countMessage = (notes.length)
		? `${ notes.length } note${ notes.length > 1 ? 's' : '' } staged from Evernote.`
		: 'No notes staged.';

	return (
		<NotesStyles>
			{/* Authenticate / Import / Parse / Save */}
			<NoteActions>
				{/* Authenticate Evernote */
					(!isAuthenticated && !isAuthenticationPending)
						? (
							<AuthenticateEvernote />
						)
						: null
				}
				{/* Import Notes */}
				{
					(isAuthenticated && remaining > 0)
						? (
							<Button
								label="Import Notes"
								onClick={ () => importNotes({ importMutation }) }
								type="button"
							/>
						)
						: null
				}

				{/* Parse Notes */}
				{
					(notes && notes.length > 0)
						? (
							<Button
								label="Parse Notes"
								onClick={ () => convertNotes({ parseNotesMutation }) }
								type="button"
							/>
						)
						: null
				}

				{/* Save Recipes */}
				{
					(converted && converted.length > 0)
						? (
							<Button
								label="Save Recipes"
								onClick={ () => saveRecipes({ saveMutation }) }
								type="button"
							/>
						)
						: null
				}
			</NoteActions>

			{/* Messaging */}
			{
				(!loading)
					? (<Description>{ countMessage }</Description>)
					: null
			}

			{/* Notes */}
			<NotesGrid notes={ notes } />
		</NotesStyles>
	);
};

Notes.defaultProps = {
	isAuthenticated: false,
	isAuthenticationPending: false,
};

Notes.propTypes = {
	isAuthenticated: PropTypes.bool,
	isAuthenticationPending: PropTypes.bool,
};

Notes.whyDidYouRender = true;

export default withApollo({ ssr: true })(pure(Notes));

const Description = styled.div`
	margin: 10px 0;
	font-size: 14px;
`;

const NoteActions = styled.div`
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

		&:first-of-type {
			margin-left: 0;
		}
	}
`;

const NotesStyles = styled.div``;
