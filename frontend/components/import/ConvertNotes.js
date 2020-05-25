import React from 'react';
import styled from 'styled-components';

import { withApollo } from '../../lib/apollo';

const ConvertNotes = () => {
	// TODO

	return (
		<ConvertNotesStyles>
			ConvertNotes
		</ConvertNotesStyles>
	);
};

ConvertNotes.whyDidYouRender = true;

export default withApollo({ ssr: true })(ConvertNotes);

const ConvertNotesStyles = styled.div``;
