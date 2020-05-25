import { useQuery, useMutation } from '@apollo/react-hooks';
import React from 'react';
import styled from 'styled-components';
import pure from 'recompose/pure';

import useEvernote from './useEvernote';
import Button from '../common/Button';
import NotesViewer from './NotesViewer';
import { withApollo } from '../../lib/apollo';
import { GET_ALL_NOTES_QUERY } from '../../lib/apollo/queries/notes';
import { CONVERT_NOTES_MUTATION, IMPORT_NOTES_MUTATION, PARSE_NOTES_MUTATION } from '../../lib/apollo/mutations/notes';

const Notes = () => {
	const [ importMutation ] = useMutation(IMPORT_NOTES_MUTATION);
	const [ parseNotesMutation ] = useMutation(PARSE_NOTES_MUTATION);
	const [ saveMutation ] = useMutation(CONVERT_NOTES_MUTATION);

	const {
		convertNotes,
		importNotes,
		remaining,
		saveRecipes,
	} = useEvernote({ importMutation });
	const { data } = useQuery(GET_ALL_NOTES_QUERY);
	const { notes = [] } = data || {};
	const converted = notes.filter((n) => (n.ingredients && n.ingredients.length) || (n.instructions && n.instructions.length));

	console.log({ converted });
	return (
		<NotesStyles>
			<ActionBar>
				{/* Import Notes */}
				{
					(remaining > 0)
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
			</ActionBar>

			{/* Notes */}
			<NotesViewer />
		</NotesStyles>
	);
};

Notes.whyDidYouRender = true;

export default withApollo({ ssr: true })(pure(Notes));

const ActionBar = styled.div`
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
