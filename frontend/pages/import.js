import { useQuery } from '@apollo/react-hooks';
import React from 'react';
import styled from 'styled-components';

import { withApollo } from '../lib/apollo';
import AuthenticateEvernote from '../components/import/AuthenticateEvernote';
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
				{/* Authenticate Evernote */}
				{!isAuthenticated && !isAuthenticationPending ? (
					<AuthenticateEvernote />
				) : null}

				{/* Notes */}
				{isAuthenticated ? (
					<Notes />
				) : null}
			</section>
		</ImportStyles>
	);
};

Import.whyDidYouRender = true;

export default withApollo({ ssr: true })(Import);

const ImportStyles = styled.article``;
