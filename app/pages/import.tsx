import { useMutation } from '@apollo/client';
import React from 'react'

import Button from '../components/common/Button';
import Page from '../components/Page';
import { AUTHENTICATE_EVERNOTE_MUTATION } from './../graphql/mutations/evernote';


type ImportProps = {
}

const Import: React.FC<ImportProps> = () => {
  const [authenticateEvernote] = useMutation(AUTHENTICATE_EVERNOTE_MUTATION, {
    update: (cache, { data: { authenticateEvernote } }) => {
      const { authURL = null } = authenticateEvernote || {};
      console.log('update', { authenticateEvernote, authURL });

      if (authURL) {
        window.open(authURL, '_self');
      }
    },
  });

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
