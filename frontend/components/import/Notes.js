import { useMutation } from '@apollo/react-hooks';
import React from 'react';
import styled from 'styled-components';
import pure from 'recompose/pure';

import useEvernote from './useEvernote';
import Button from '../common/Button';
import NotesViewer from './NotesViewer';
import { withApollo } from '../../lib/apollo';
import { IMPORT_NOTES_MUTATION } from '../../lib/apollo/mutations/notes';
// import { GET_NOTES_COUNT_QUERY } from '../lib/apollo/queries/notes';

const Notes = () => {
	const [ importMutation ] = useMutation(IMPORT_NOTES_MUTATION);

	const {
		converted,
		convertNotes,
		importNotes,
		notes,
		remaining,
		saveRecipes,
	} = useEvernote({ importMutation });

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
								onClick={ convertNotes }
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
								onClick={ saveRecipes }
								type="button"
							/>
						)
						: null
				}
			</ActionBar>
			<NotesViewer notes={ notes } />
		</NotesStyles>
	);
};

Notes.whyDidYouRender = true;

export default withApollo({ ssr: true })(pure(Notes));

const ActionBar = styled.div``;

const NotesStyles = styled.div``;
