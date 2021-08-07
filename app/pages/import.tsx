import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'

import Button from '../components/common/Button';
import Page from '../components/Page';
import { AUTHENTICATE_EVERNOTE_MUTATION } from './../graphql/mutations/evernote';


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

  useEffect(handleEvernoteAuthVerifier, [oauth_verifier]);

  function handleAuthentication() {
    authenticateEvernote();
  }

  return (
    <Page title='Import'>
      <Button
        label='Authenticate Evernote'
        onClick={handleAuthentication}
        type='button'
      />
    </Page>
  )
}

export default Import
