
import styled, { keyframes } from 'styled-components';
import React, { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ALL_NOTES_QUERY } from '../../graphql/queries/note';

const defaultStatus = {
  meta: false,
  content: false,
  parsing: false,
  saving: false,
};

const sortByDateCreatedDesc = (a: Note, b: Note) => (+a?.createdAt < +b?.createdAt) ? 1 : -1;

const Notes: React.FC = ({ status = defaultStatus }) => {
  const { data = {} } = useQuery(GET_ALL_NOTES_QUERY, {
    fetchPolicy: 'cache-and-network'
  });
  let { notes = [] } = data;
  // TODO we should really do this sort on the backend; might need to add a createdAt on noteMeta
  notes = [...notes].sort(sortByDateCreatedDesc);
  const className = status.meta ? 'loading' : '';
  console.log('%c NOTES ', 'background: pink; color: black;', { notes }, className);

  // useEffect(() => {
  //   console.log('useEffect - should i refetch?', { data});
  //   refetch();
  // }, [status.meta]);

  function renderNotes() {
    return notes.map((note, index) => (
      <Note key={`note_${note?.evernoteGUID}_${index}`} className={className}>
        {/* Title */}
        <Title className={!note?.title ? className : ''}>
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
