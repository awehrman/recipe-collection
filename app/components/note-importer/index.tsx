import React, { useState } from 'react';
import styled from 'styled-components';

import useAdminTools from '../../hooks/use-admin-tools';
import useEvernote from '../../hooks/use-evernote';
import useNotes from '../../hooks/use-notes';
import { Button } from '../common';
import AuthenticateEvernote from './authenticate-evernote';
import { NoteImporterProps } from './types';
import Notes from '../notes';

const NoteImporter: React.FC<NoteImporterProps> = () => {
  const { resetDatabase } = useAdminTools();
  const { isAuthenticated } = useEvernote();
  const [isImporting, setIsImporting] = useState(false);
  const { importNotes, refetchNotes } = useNotes(setIsImporting);

  function handleImportNotes() {
    setIsImporting(true);
    importNotes();
  }

  // function handleRecipeSave() {
  //   saveRecipes();
  // }

  function handleReset() {
    resetDatabase();
    refetchNotes();
  }

  // useEffect(_.noop, [refresh]);

  return (
    <Wrapper>
      <NoteActions>
        {/* Authenticate Evernote */}
        <AuthenticateEvernote />

        {/* Import Notes */}
        {isAuthenticated ? (
          <Button
            disabled={isImporting}
            label='Import Notes'
            onClick={handleImportNotes}
          />
        ) : null}

        {/* Notes */}
        <Notes isImporting={isImporting} />
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
