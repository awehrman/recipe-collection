import { useMutation } from '@apollo/client';
import React from 'react'

import Button from '../components/common/Button';
import Page from '../components/Page';
import { AUTHENTICATE_EVERNOTE_MUTATION } from './../graphql/mutations/evernote';


type ImportProps = {
}

const Import: React.FC<ImportProps> = () => {
  const [authenticateEvernote] = useMutation(AUTHENTICATE_EVERNOTE_MUTATION);

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
