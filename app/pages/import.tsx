import React from 'react'

import NoteImporter from '../components/note-importer';
import Page from '../components/Page';

type ImportProps = {
}

const Import: React.FC<ImportProps> = () => (
  <Page title='Import'>
    <NoteImporter />
  </Page>
);

export default Import
