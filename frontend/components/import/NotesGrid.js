import React from 'react';
import PropTypes from 'prop-types';
import pure from 'recompose/pure';
import styled from 'styled-components';

import Note from './Note';

const NotesGrid = ({ notes }) => (
	<NotesGridStyles>
		{
			(notes)
				? notes.map((n, index) => (
					// eslint-disable-next-line
					<Note key={`${ index }_${ n.id }`} note={ n } />
				))
				: null
		}
	</NotesGridStyles>
);

NotesGrid.whyDidYouRender = true;

export default pure(NotesGrid);

// eslint-disable-next-line react/forbid-prop-types
NotesGrid.propTypes = { notes: PropTypes.array.isRequired };

const NotesGridStyles = styled.div`
	margin: 20px 0;
	max-width: 850px;
`;
