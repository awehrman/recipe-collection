import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'

import Button from '../components/common/Button';
import Page from '../components/Page';
import { AUTHENTICATE_EVERNOTE_MUTATION, CLEAR_EVERNOTE_AUTH_MUTATION } from './../graphql/mutations/evernote';
import { IMPORT_LOCAL_MUTATION } from './../graphql/mutations/import';

type ImportProps = {
}

const Import: React.FC<ImportProps> = () => {
  const router = useRouter();
	const { query: { oauth_verifier } } = router;
  const [authenticateEvernote] = useMutation(AUTHENTICATE_EVERNOTE_MUTATION, {
    update: (cache, { data: { authenticateEvernote } }) => {
      const { authURL = null } = authenticateEvernote || {};
      console.log('update', { authenticateEvernote, authURL });

      if (authURL) {
        window.open(authURL, '_self');
      }
    },
  });
  const [importData] = useMutation(IMPORT_LOCAL_MUTATION, {
    update: (cache, { data }) => {
      console.log({ data });
    },
  });
  const [clearAuthentication] = useMutation(CLEAR_EVERNOTE_AUTH_MUTATION, {
    update: () => {
      console.log('finished clearing session data');
    },
  });

  function handleEvernoteAuthVerifier() {
    if (oauth_verifier) {
			authenticateEvernote({
				update: () => {
					// update url
					router.replace('/import', '/import', { shallow: true });
				},
				variables: { oauthVerifier: oauth_verifier },
			});
		}
  }

  function handleClearAuthentication() {
    clearAuthentication();
  }

  useEffect(handleEvernoteAuthVerifier, [oauth_verifier]);

  function handleAuthentication() {
    authenticateEvernote();
  }

  function handleLocalImport() {
    importData();
  }

  return (
    <Page title='Import'>
      <Button
        label='Authenticate Evernote'
        onClick={handleAuthentication}
        type='button'
      />
      <Button
        label='Import Local'
        onClick={handleLocalImport}
        type='button'
      />
      <Button
        label='Clear Authentication'
        onClick={handleClearAuthentication}
        type='button'
      />
    </Page>
  )
}

export default Import
