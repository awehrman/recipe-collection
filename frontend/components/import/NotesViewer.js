import React from 'react';
import styled from 'styled-components';

import { withApollo } from '../../lib/apollo';

const NotesViewer = () => {
	// TODO

	return (
		<NotesViewerStyles>
			NotesViewer
		</NotesViewerStyles>
	);
};

NotesViewer.whyDidYouRender = true;

export default withApollo({ ssr: true })(NotesViewer);

const NotesViewerStyles = styled.div``;
