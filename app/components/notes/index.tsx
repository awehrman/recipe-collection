import React from 'react';
import styled from 'styled-components';

import useNotes from '../../hooks/use-notes';
import { Loading } from '../common';

import Note from './note';
import { NoteProps, NotesProps } from './types';

const Notes: React.FC<NotesProps> = () => {
  const { notes, loading } = useNotes();
  console.log({ notes });
  function renderNotes() {
    if (loading) {
      return <Loading />
    }
    return notes?.map((note: NoteProps, index: number) => <Note key={note?.id ?? index} note={note} />);
  }

  return (
    <Wrapper>
      {/* Notes */}
      {renderNotes()}
    </Wrapper>
  );
};

export default Notes;

const Wrapper = styled.div`
	margin: 20px 0;
	max-width: 850px;
`;
