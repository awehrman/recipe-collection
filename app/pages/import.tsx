import React from 'react'
import Button from '../components/common/Button';

import Page from '../components/Page';

type ImportProps = {
}

const Import: React.FC<ImportProps> = () => {
  function handleAuthentication() {
    // TODO
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
