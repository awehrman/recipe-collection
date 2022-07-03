import styled, { keyframes } from 'styled-components';
import React from 'react';

import useNotes from '../../hooks/use-notes';

const defaultStatus = {
  meta: false,
  content: false,
  parsing: false,
  saving: false,
};

const Notes: React.FC = ({ status = defaultStatus }) => {
  const { notes } = useNotes(status);
  console.log({ ...status });
  console.log(notes);

  // function renderIngredients(note) {
  //   return (note?.ingredients ?? []).map((line, index) => (
  //     <IngredientLine key={`${note.id}_ingredient_line_${line.id}_${index}`}>
  //       {line.reference}
  //     </IngredientLine>
  //   ));
  // }

  // function renderNotes() {
  //   return notes.map((note, index) => (
  //     <Note key={`note_${note?.evernoteGUID}_${index}`}>
  //       {/* Title */}
  //       <Title className={status.meta ? 'loading' : ''}>{note.title}</Title>

  //       {/* Image */}

  //       {/* Ingredients */}
  //       <Ingredients className={status.content ? 'loading' : ''}>
  //         {(note?.ingredients ?? []).map((line, index) => (
  //           <IngredientLine
  //             key={`${note.id}_ingredient_line_${line.id}_${index}`}
  //           >
  //             {line?.reference ?? 'butts'}
  //           </IngredientLine>
  //         ))}
  //       </Ingredients>

  //       {/* Instructions */}
  //     </Note>
  //   ));
  // }

  return (
    <Wrapper>
      {/* Notes */}
      {notes.map((note, index) => (
      <Note key={`note_${note?.evernoteGUID}_${index}`}>
        {/* Title */}
        <Title className={status.meta ? 'loading' : ''}>{note.title}</Title>

        {/* Image */}

        {/* Ingredients */}
        <Ingredients className={status.content ? 'loading' : ''}>
          {(note?.ingredients ?? []).map((line, index) => (
            <IngredientLine
              key={`${note.id}_ingredient_line_${line.id}_${index}`}
            >
              {line?.reference ?? 'butts'}
            </IngredientLine>
          ))}
        </Ingredients>

        {/* Instructions */}
      </Note>
    ))}
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

const Ingredients = styled.ul``;

const IngredientLine = styled.li`
  background: pink;

  &.loading {
    border-radius: 5px;
    animation: ${loading} 1s linear infinite alternate;
    width: 10%;
    border-radius: 5px;
    height: 13px;
    margin: 5px 0;
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
