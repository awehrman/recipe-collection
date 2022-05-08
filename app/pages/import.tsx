import React from 'react'

import Page from '../components/Page';
import NoteImporter from '../components/note-importer';

type ImportProps = {
}

const Import: React.FC<ImportProps> = () => (
  <Page title='Import'>
    <NoteImporter />
  </Page>
);

export default Import
