import _ from 'lodash';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import useAdminTools from '../../hooks/use-admin-tools';
import useEvernote from '../../hooks/use-evernote';
import useNotes from '../../hooks/use-notes';
import { Button, Loading } from '../common';
import AuthenticateEvernote from './authenticate-evernote';
import { NoteImporterProps } from './types';
import Notes from '../notes';

const NoteImporter: React.FC<NoteImporterProps> = () => {
  const { importNotes, isAuthenticated, loadingNotes } = useEvernote();
  const { notes, loading, parseNotes, saveRecipes } = useNotes();
  const { resetDatabase } = useAdminTools();
  const showParseButton = !loading && notes?.length > 0;
  const hasParsedNotes = !loading && notes?.length > 0 && _.some(notes, (note) => note.isParsed);
  const showSaveButton = hasParsedNotes;
  const [refresh, triggerRefresh] = useState(false);

  function handleImportNotes() {
    importNotes();
  }

  function handleParseNotes() {
    parseNotes();
  }

  function handleRecipeSave() {
    saveRecipes();
  }

  function handleReset() {
    resetDatabase();
    triggerRefresh(!refresh);
  }

  useEffect(_.noop, [refresh]);

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

        {/* Parse Notes */}
        {showParseButton ? (
          <Button
            label='Parse Notes'
            onClick={handleParseNotes}
            type='button'
          />
        ) : null}

        {/* Save Recipes */}
        {showSaveButton ? (
          <Button
            label='Save Recipes'
            onClick={handleRecipeSave}
            type='button'
          />
        ) : null}

        {/* Loading */}
        {loadingNotes && <Loading />}

        {/* Notes */}
        <Notes />
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
