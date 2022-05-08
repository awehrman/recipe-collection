import { useQuery, useMutation } from '@apollo/client';
import { useSession } from 'next-auth/client';
import React from 'react';
import styled from 'styled-components';

import { IMPORT_NOTES_MUTATION } from '../../graphql/mutations/note';
import { GET_USER_AUTHENTICATION_QUERY } from '../../graphql/queries/user';
import useEvernote from '../../hooks/use-evernote';

import { Button, Loading } from '../common';

import AuthenticateEvernote from './authenticate-evernote';
import { NoteImporterProps } from './types';

const NoteImporter: React.FC<NoteImporterProps> = () => {
  const { importNotes } = useEvernote();
  const [mutation, { loading: noteLoading, data: noteData }] = useMutation(IMPORT_NOTES_MUTATION);
  // TODO move all of this into the useEvernote hook
  const [session] = useSession();
  const { data, loading } = useQuery(GET_USER_AUTHENTICATION_QUERY, {
    fetchPolicy: 'network-only',
    variables: { id: session?.user?.userId },
  });
  const evernoteAuthToken = !loading && data?.user?.evernoteAuthToken;
  const evernoteExpiration = !loading && data?.user?.evernoteExpiration;
  const isExpired = !loading &&  Date.now() > parseInt(evernoteExpiration);
  const isAuthenticated = !loading && evernoteAuthToken && !isExpired;

  if (noteLoading) {
    return <Loading />;
  }

  if (noteData?.length) {
    console.log({ noteData });
  }

  function handleImportNotes() {
    importNotes(mutation);
  }

  return (
    <Wrapper>
      <NoteActions>
        {/* Authenticate Evernote or Clear Authentication  */}
        <AuthenticateEvernote />

        {/* Import Notes */}
        {isAuthenticated ? (
          <Button
            label='Import Notes'
            onClick={handleImportNotes}
            type='button'
          />
        ) : null}
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
    background: '#73C6B6';
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

// const Description = styled.div`
//   margin: 10px 0;
//   font-size: 14px;
// `;

//   {/* Parse Notes */}
//   {notes && notes.length > 0 ? (
//     <Button
//       label='Parse Notes'
//       onClick={() => convertNotes({ parseNotesMutation })}
//       type='button'
//     />
//   ) : null}

//   {/* Save Recipes */}
//   {converted && converted.length > 0 ? (
//     <Button
//       label='Save Recipes'
//       onClick={() => saveRecipes({ saveMutation })}
//       type='button'
//     />
//   ) : null}
// </NoteActions>

// {/* Messaging */}
// {!loading ? <Description>{countMessage}</Description> : null}

// {/* Notes */}
// <NotesGrid notes={notes} />
