import React from 'react';
import styled from 'styled-components';

import useNotes from '../../hooks/use-notes';
import { Button, Loading } from '../common';
import Parser from '../../lib/line-parser-min.js';

import Note from './note';
import { NoteProps, NotesProps } from './types';

const Notes: React.FC<NotesProps> = () => {
  const { notes, loading } = useNotes();

  function handleParseTest() {
    const string = '1 cup fresh sliced apples, cut into pieces';
    const result = Parser.parse(string);
    console.log({ string, result });
  }

  function renderNotes() {
    if (loading) {
      return <Loading />
    }
    return notes?.map((note: NoteProps, index: number) =>
      <Note key={note?.id ?? index} note={note} />);
  }

  return (
    <Wrapper>
      <Button label='press me' onClick={handleParseTest} />
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
