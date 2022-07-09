import styled, { keyframes } from 'styled-components';
import React from 'react';

import { defaultLoadingStatus } from '../../constants/note';
import { StatusProps } from '../../types/note';
import useNotes from '../../hooks/use-notes';

import Ingredients from './ingredients';
import Instructions from './instructions';

type NotesProps = {
  status: StatusProps
};
const Notes: React.FC<NotesProps> = ({ status = defaultLoadingStatus }) => {
  const { notes } = useNotes(status);

  function renderNotes() {
    return notes.map((note, index) => {
      const { evernoteGUID, ingredients = [], instructions = [], title} = note;
      const showContent = ingredients.length > 0 || instructions.length > 0;

      return (
      <Note key={`note_${evernoteGUID}_${index}`}>
        {/* Title */}
        <Title className={status.meta ? 'loading' : ''}>{title}</Title>

        {/* Image */}

        {/* Content */}
        {showContent ? (
          <ContentStyles>
            <Ingredients ingredients={ingredients} status={status} />
            <Instructions instructions={instructions} status={status} />
          </ContentStyles>
        ) : null}
      </Note>
    )});
  }

  return (
    <Wrapper>
      {/* Notes */}
      {renderNotes()}
    </Wrapper>
  );
};

export default Notes;

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

const ContentStyles = styled.div`
  width: 100%;
  overflow: scroll;
  flex-basis: 100%;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  hr {
    border: 0;
    height: 0;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    width: 50%;
    margin: 30px auto;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  pre {
    white-space: pre-wrap;
  }
`;
