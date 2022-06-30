import React from 'react';
import styled from 'styled-components';

import useNotes from '../../hooks/use-notes';
import { Loading } from '../common';

import Note from './note';
import ParsedNote from './parsed-note';

const Notes: React.FC = () => {
  const { notes, loading } = useNotes();
  if (!loading) {
    console.log({ notes });
  }

  function renderNotes() {
    if (loading) {
      return <Loading />
    }
    return notes?.map((note, index) => {
      if (note.isParsed) {
        return (<ParsedNote key={`parsed_${note?.id ?? index}`} note={note} />);
      }
      return (<Note key={note?.id ?? index} note={note} />);
    });
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
