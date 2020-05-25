// import { useQuery } from '@apollo/react-hooks';
import React from 'react';
import styled from 'styled-components';

import ImportNotes from './ImportNotes';
import NotesViewer from './NotesViewer';
import { withApollo } from '../../lib/apollo';
// import { GET_NOTES_COUNT_QUERY } from '../lib/apollo/queries/notes';

const Notes = () => {
	// TODO
	const unimportedNotes = 9999;

	return (
		<NotesStyles>
			<ActionBar>
				{/* Import Notes */}
				{
					(unimportedNotes > 0)
						? <ImportNotes />
						: null
				}

				{/* Parse Notes */}

				{/* Save Recipes */}
			</ActionBar>
			<NotesViewer />
		</NotesStyles>
	);
};

Notes.whyDidYouRender = true;

export default withApollo({ ssr: true })(Notes);

const ActionBar = styled.div``;

const NotesStyles = styled.div``;
