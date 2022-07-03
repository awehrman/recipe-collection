import styled, { keyframes } from 'styled-components';
import React from 'react';

import {
  IngredientLine,
  InstructionLine,
  ParsedSegment,
} from '../../types/note';

import useNotes from '../../hooks/use-notes';

const defaultStatus = {
  meta: false,
  content: false,
  saving: false,
};

type IngredientsProps = {
  ingredients: IngredientLine[];
  status: unknown;
};

const sortByIndexAsc = (a: ParsedSegment, b: ParsedSegment) =>
  a?.index > b?.index ? 1 : -1;

const IngredientLines: React.FC<IngredientsProps> = ({
  ingredients = [],
  status,
}) => {
  const ingBlocks = [...new Set(ingredients.map((i) => i.blockIndex))];

  function renderParsed(key: string, parsed: ParsedSegment[] = []) {
    const sortedParsed = parsed?.length
      ? [...parsed].sort(sortByIndexAsc)
      : parsed;
    return sortedParsed.map((v) => {
      let ingClassName = '';
      if (v.ingredient) {
        ingClassName = v.ingredient.isValidated ? ' valid' : ' invalid';
      }
      // if v.value starts with a comma, remove the initial space
      // TODO extend this to a lookup of allowed punctuation characters
      const hasComma = v.value[0] === ',' ? 'noSpace' : '';

      return (
        <span
          key={`_${v.value}`}
          className={`${v.type} ${ingClassName} ${hasComma}`}
        >
          {v.value}
        </span>
      );
    });
  }

  function renderBlock(index: number, status: unknown) {
    const blockIngredients = ingredients.filter((i) => i.blockIndex === index);

    return blockIngredients.map((line, lineIndex) => (
      <IngredientListItem
        key={`parsed_ingredient_block_${index}_${line?.id ?? lineIndex}`}
        className={status.content ? 'loading' : ''}
      >
        {line.isParsed && line?.parsed ? (
          <Parsed>
            {renderParsed(
              `${index}${line.id}_${line.blockIndex}_${line.lineIndex}`,
              line.parsed
            )}
          </Parsed>
        ) : (
          <span className='unparsed'>{line.reference}</span>
        )}
      </IngredientListItem>
    ));
  }

  function renderIngredients(status) {
    return ingBlocks.map((blockIndex) => (
      <Block key={`parsed_ingredient_block${blockIndex}`} className='block'>
        {renderBlock(blockIndex, status)}
      </Block>
    ));
  }

  return <IngredientList>{renderIngredients(status)}</IngredientList>;
};

type InstructionsProps = {
  instructions: InstructionLine[];
  status: unknown;
};

const Instructions: React.FC<InstructionsProps> = ({
  instructions = [],
  status,
}) => {
  function renderIngredients(status) {
    return instructions.map((instruction) => (
      <InstructionListItem
        key={`parsed_instruction_${instruction.id}`}
        className={status.content ? 'loading' : ''}
      >
        {instruction.reference}
      </InstructionListItem>
    ));
  }

  return <InstructionList>{renderIngredients(status)}</InstructionList>;
};

const Notes: React.FC = ({ status = defaultStatus }) => {
  const { notes } = useNotes(status);
  console.log('%c render', 'background: mediumseagreen; color: black;');

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
            <IngredientLines ingredients={ingredients} status={status} />
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

const Block = styled.ul`
  &:last-of-type {
    margin-bottom: 20px;
  }
`;
const Parsed = styled.span`
  span {
    margin-left: 2px;

    &:first-of-type {
      margin-left: 0px;
    }

    &.noSpace {
      margin-left: 0px;
    }

    &.ingredient {
      font-weight: 900;
      color: orange;

      &.valid {
        color: #222;
      }

      &.invalid {
        color: ${({ theme }) => theme.colors.altGreen};
      }
    }
  }
`;

const IngredientList = styled.ul`
  &&& {
    margin-top: 20px;
  }
`;

const InstructionList = styled.ul``;

const IngredientListItem = styled.li`
  margin-bottom: 2px;

  &:last-of-type {
    margin-bottom: 12px;
  }

  &.loading {
    border-radius: 5px;
    animation: ${loading} 1s linear infinite alternate;
    width: 15%;
    border-radius: 5px;
    height: 13px;
    margin: 5px 0;
  }
`;

const InstructionListItem = styled.li`
  margin-bottom: 12px;

  &.loading {
    border-radius: 5px;
    animation: ${loading} 1s linear infinite alternate;
    width: 100%;
    border-radius: 5px;
    height: 13px;
    margin: 5px 0;
  }
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
