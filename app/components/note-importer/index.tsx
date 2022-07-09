import _ from 'lodash';
import React, { useState } from 'react';
import styled from 'styled-components';

import { defaultLoadingStatus } from '../../constants/note';
import useAdminTools from '../../hooks/use-admin-tools';
import useEvernote from '../../hooks/use-evernote';
import useNotes from '../../hooks/use-notes';

import { Button } from '../common';
import Notes from '../notes';

import AuthenticateEvernote from './authenticate-evernote';

type NoteImporterProps = {
};

const NoteImporter: React.FC<NoteImporterProps> = () => {
  const { resetDatabase } = useAdminTools();
  const { isAuthenticated } = useEvernote();
  const [status, setStatus] = useState(defaultLoadingStatus);
  const { importNotes, notes = [], saveRecipes } = useNotes(status, setStatus);
  const notLoading = !_.every(_.values(defaultLoadingStatus));

  function handleImportNotes() {
    importNotes();
  }

  function handleReset() {
   resetDatabase();
  }

  function handleSaveRecipes() {
    saveRecipes();
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

         {/* Save Recipes */}
         {notes.length > 0 && notLoading ? (
          <Button
            disabled={status.saving}
            label='Save Recipes'
            onClick={handleSaveRecipes}
          />
        ) : null}

        {/* No Notes Placeholder */}
        {notes.length === 0 && notLoading ? <Placeholder>No imported notes.</Placeholder> : null}

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

const Placeholder = styled.div`
  font-size: 14px;
  color: #222;
  margin-top: 10px;
`;

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
