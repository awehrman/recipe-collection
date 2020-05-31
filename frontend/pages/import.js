import { useQuery } from '@apollo/react-hooks';
import React from 'react';
import styled from 'styled-components';

import { withApollo } from '../lib/apollo';
import Notes from '../components/import/Notes';
import Header from '../components/Header';
import { IS_EVERNOTE_AUTHENTICATED_QUERY } from '../lib/apollo/queries/evernote';

const Import = () => {
	const { data } = useQuery(IS_EVERNOTE_AUTHENTICATED_QUERY);
	const isAuthenticated = data?.isEvernoteAuthenticated?.isAuthenticated || false;
	const isAuthenticationPending = data?.isEvernoteAuthenticated?.isAuthenticationPending || false;

	return (
		<ImportStyles>
			<Header pageHeader="Import" />
			<section>
				{/* Notes */}
				<Notes
					isAuthenticated={ isAuthenticated }
					isAuthenticationPending={ isAuthenticationPending }
				/>
			</section>
		</ImportStyles>
	);
};

Import.whyDidYouRender = true;

export default withApollo({ ssr: true })(Import);

const ImportStyles = styled.article``;
