import React, { useState } from 'react';
import styled from 'styled-components';

import useAdminTools from '../../hooks/use-admin-tools';
import useEvernote from '../../hooks/use-evernote';
import useNotes from '../../hooks/use-notes';

import { Button } from '../common';
import Notes from '../notes';

import AuthenticateEvernote from './authenticate-evernote';
import { NoteImporterProps } from './types';

const defaultLoadingStatus = {
  meta: false,
  content: false,
  parsing: false,
  saving: false,
};

const NoteImporter: React.FC<NoteImporterProps> = () => {
  const { resetDatabase } = useAdminTools();
  const { isAuthenticated } = useEvernote();
  const [status, setStatus] = useState(defaultLoadingStatus);
  const { importNotes } = useNotes(status, setStatus);

  function handleImportNotes() {
    importNotes();
  }

  function handleReset() {
   resetDatabase();
  }

  return (
    <Wrapper>
      <NoteActions>
        {/* Authenticate Evernote */}
        <AuthenticateEvernote />

        {/* Import Notes */}
        {isAuthenticated ? (
          <Button
            disabled={status.meta}
            label='Import Notes'
            onClick={handleImportNotes}
          />
        ) : null}

        {/* Notes */}
        <Notes status={status} />
      </NoteActions>

      {/* TEMP dev shortcuts */}
      <AdminHelpers>
          <Button label='reset' onClick={handleReset} type='button' />
      </AdminHelpers>
    </Wrapper>
  );
};

export default NoteImporter;

const AdminHelpers = styled.div`
  button {
    cursor: pointer;
    color: tomato;
    background: transparent;
    padding: 4px 6px;
    margin: 0;
    border: 0;
    font-size: 18px;
    position: absolute;
    right: 20px;
    top: 120px;

    :hover {
      background: lightsalmon;
      color: white;
      border-radius: 5px;
    }
  }
`;

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
