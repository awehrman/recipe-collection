import _ from 'lodash';
import React, { useState } from 'react';
import styled from 'styled-components';
import { gql, useMutation } from '@apollo/client';

import { GET_NOTES_METADATA_MUTATION } from '../../graphql/mutations/note';
import { GET_ALL_NOTES_QUERY } from '../../graphql/queries/note';

import useAdminTools from '../../hooks/use-admin-tools';
import useEvernote from '../../hooks/use-evernote';
import { Button } from '../common';
import AuthenticateEvernote from './authenticate-evernote';
import { NoteImporterProps } from './types';
import Notes from '../notes';

const defaultLoadingStatus = {
  meta: false,
  content: false,
  parsing: false,
  saving: false,
};

const DEFAULT_ARRAY_SIZE = 5; // TODO load this from env
const loadingSkeleton = new Array(DEFAULT_ARRAY_SIZE).fill(null).map((_empty, index) => ({
  id: index,
  evernoteGUID: `loading_${index}`,
  title: null,
  __typename: 'Note',
}));

const fragment = gql`
  fragment NoteMeta on Note {
    id
    evernoteGUID
    title
  }
`;

const NoteImporter: React.FC<NoteImporterProps> = () => {
  const { resetDatabase } = useAdminTools();
  const { isAuthenticated } = useEvernote();
  const [status, setStatus] = useState(defaultLoadingStatus);

  const [getNotesMeta, { data: meta }] = useMutation(GET_NOTES_METADATA_MUTATION, {
    optimisticResponse: {
      getNotesMeta: {
        error: null,
        notes: loadingSkeleton,
        __typename: 'StandardResponse',
      }
    },
    // refetchQueries: [
    //   { query: GET_ALL_NOTES_QUERY }
    // ],
    update: (cache, { data: { getNotesMeta } }) => {
      const isOptimisticResponse = _.some(getNotesMeta.notes, (note) => _.includes(note.evernoteGUID, 'loading_'));
      console.log({ isOptimisticResponse });
      // update loading status
      if (!isOptimisticResponse) {
        const updatedStatus = {...status};
        updatedStatus.meta = false;
        updatedStatus.content = true;
        setStatus(updatedStatus);
      }

      console.log('%c ~ ~ ~ modifying the cache ~ ~ ~', 'background: orange; color: black;');
      const newNotesFromResponse = getNotesMeta?.notes ?? [];
      const existingNotes = cache.readQuery({
        query: GET_ALL_NOTES_QUERY,
      });

      const data = {
        notes: _.flatMap([
          // we'll have to pick out the optimistic response here
          newNotesFromResponse,
          ...existingNotes?.notes,
        ]),
      };

      console.log({ existingNotes, data });
      if (existingNotes && newNotesFromResponse) {
        cache.writeQuery({
          query: GET_ALL_NOTES_QUERY,
          data,
        });
      }
      console.log('post mod', JSON.stringify(cache.data.data, null, 2));

      // we need to write the notes response here to the notesQuery directly in the cache
      // while the optimisticResponse will be in this mutation, it won't be tied to getNotes
      // TODO kick off next stage of import process
      return getNotesMeta.notes;
    }
  });

  console.log({ ...meta});
  function handleImportNotes() {
    const updated = {...status};
    updated.meta = true;
    setStatus(updated);
    getNotesMeta();
  }

  // function handleRecipeSave() {
  //   saveRecipes();
  // }

  function handleReset() {
   resetDatabase();
  //  forceClear();
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
