import React from 'react';
import styled from 'styled-components';

import { withApollo } from '../../lib/apollo';

const ParseNotes = () => {
	// TODO

	return (
		<ParseNotesStyles>
			ParseNotes
		</ParseNotesStyles>
	);
};

ParseNotes.whyDidYouRender = true;

export default withApollo({ ssr: true })(ParseNotes);

const ParseNotesStyles = styled.div``;
