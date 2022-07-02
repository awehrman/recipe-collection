import styled, { keyframes } from 'styled-components';
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import useNotes from '../../hooks/use-notes';

const DEFAULT_ARRAY_SIZE = 5; // TODO load this from env

const loadingSkeleton = new Array(DEFAULT_ARRAY_SIZE).fill(null).map((_empty, index) => ({
  id: index,
  evernoteGUID: index,
  title: null,
}));

const Notes: React.FC = ({ isImporting = false }) => {
  const { notes } = useNotes();
  const noteList = !isImporting ? notes : loadingSkeleton;
  const className = isImporting ? 'loading' : '';

  function renderNotes() {
    return noteList.map((note, index) => (
      <Note key={`note_${note?.evernoteGUID}_${index}`} className={className}>
        {/* Title */}
        <Title className={className}>
          {note.title}
        </Title>
      </Note>
    ));
  }

  return (
    <Wrapper>
      {/* Notes */}
      {renderNotes()}
    </Wrapper>
  );
};

export default Notes;

// TODO move all loading skeletons to another component file
const loading = keyframes`
  0% {
    background: rgba(238, 238, 238, 1);
  }
  100% {
    background: rgba(230, 230, 230, 1);
  }
`;

const Title = styled.span`
  font-weight: normal;
  font-size: 18px;
  font-weight: 300;
  margin: 0;
  min-width: 1px;

  &.loading {
    border-radius: 5px;
    animation: ${loading} 1s linear infinite alternate;
    width: 35%;
    border-radius: 5px;
    height: 13px;
    margin: 5px 0;
  }
`;

const Note = styled.li`
  background: ${({ theme }) => theme.colors.headerBackground};
  margin: 20px 0;
  padding: 12px 24px;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const Wrapper = styled.ul`
	margin: 0;
  padding: 0;
	max-width: 850px;
  list-style: none;
`;
