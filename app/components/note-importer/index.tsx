import React from 'react';
import styled from 'styled-components';

import useEvernote from '../../hooks/use-evernote';
import { Button, Loading } from '../common';
import AuthenticateEvernote from './authenticate-evernote';
import { NoteImporterProps } from './types';
import Notes from '../notes';

const NoteImporter: React.FC<NoteImporterProps> = () => {
  const { importNotes, isAuthenticated, loadingNotes } = useEvernote();

  function handleImportNotes() {
    importNotes();
  }

  return (
    <Wrapper>
      <NoteActions>
        {/* Authenticate Evernote */}
        <AuthenticateEvernote />

        {/* Import Notes */}
        {isAuthenticated ? (
          <Button
            label='Import Notes'
            onClick={handleImportNotes}
            type='button'
          />
        ) : null}

        {/* Loading */}
        {loadingNotes && <Loading />}

        {/* Notes */}
        <Notes />
      </NoteActions>
    </Wrapper>
  );
};

export default NoteImporter;

const Wrapper = styled.div``;

const NoteActions = styled.div`
  button {
    cursor: pointer;
    border: 0;
    color: white;
    background: #73C6B6;
    border-radius: 5px;
    padding: 6px 10px;
    font-size: 16px;
    font-weight: 600;
    margin: 0 10px 10px;

    &:first-of-type {
      margin-left: 0;
    }
  }
`;
