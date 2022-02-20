import { useMutation } from '@apollo/client';
import { useSession } from 'next-auth/client';
import React from 'react';
import styled from 'styled-components';

// import useEvernote from '../../hooks/use-evernote';
import Button from '../common/Button';
import AuthenticateEvernote from './authenticate-evernote';
import { IMPORT_NOTES_MUTATION } from '../../graphql/mutations/note';

type NoteImporterProps = {

};

const NoteImporter: React.FC<NoteImporterProps> = () => {
  const [session] = useSession();
  const { evernoteAuthToken, expires } = session || {};
  const isAuthenticated = evernoteAuthToken && new Date(expires) > new Date();
  console.log({ isAuthenticated });
  // const {
	// 	// convertNotes,
	// 	importNotes,
	// 	remaining,
	// 	// saveRecipes,
	// } = useEvernote();
  const remaining = 9999;
 const [importNotes] = useMutation(IMPORT_NOTES_MUTATION, {
    update: (cache, { data }) => {
      console.log('importNotes', { data });
    },
  });

  function handleImportNotes() {
    importNotes();
  }
  return (
    <Wrapper>
      {/* Authenticate / Import / Parse / Save */}
      <NoteActions>
          {/* Authenticate Evernote or Clear Authentication  */}
          <AuthenticateEvernote />

          {/* Import Notes */}
          {isAuthenticated && remaining > 0 ? (
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