import React from 'react';
import styled from 'styled-components';

import useNotes from '../../hooks/use-notes';
import { Loading } from '../common';

import Note from './note';

const Notes: React.FC = () => {
  const { notes, loading } = useNotes();
  console.log({ notes });

  function renderNotes() {
    if (loading) {
      return <Loading />
    }
    return notes?.map((note, index) =>
      <Note key={note?.id ?? index} note={note} />);
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
