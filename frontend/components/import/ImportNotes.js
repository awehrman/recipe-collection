import React from 'react';
import styled from 'styled-components';

import { withApollo } from '../../lib/apollo';

const ImportNotes = () => {
	// TODO

	return (
		<ImportNotesStyles>
			ImportNotes
		</ImportNotesStyles>
	);
};

ImportNotes.whyDidYouRender = true;

export default withApollo({ ssr: true })(ImportNotes);

const ImportNotesStyles = styled.div``;
