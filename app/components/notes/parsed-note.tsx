import React from 'react';
import styled from 'styled-components';

import { Note, IngredientLine, InstructionLine, ParsedSegment } from '../../types/note';

type ParsedNotePageProps = {
  note: Note
};

type IngredientsProps = {
  ingredients: IngredientLine[]
};

const sortByIndexAsc = (a: ParsedSegment, b: ParsedSegment) => (a?.index > b?.index) ? 1 : -1;

const Ingredients: React.FC<IngredientsProps> = ({ ingredients }) => {
  const ingBlocks = [...new Set(ingredients.map((i) => i.blockIndex))];

  function renderParsed(key: string, parsed: ParsedSegment[] = []) {
    console.log({ parsed });
    const sortedParsed = parsed?.length ? [...parsed].sort(sortByIndexAsc) : parsed;
    console.log({ sortedParsed });
    return sortedParsed.map((v) => {
      let ingClassName = '';
      if (v.ingredient) {
        ingClassName = (v.ingredient.isValidated) ? ' valid' : ' invalid';
      }
      // if v.value starts with a comma, remove the initial space
      // TODO extend this to a lookup of allowed punctuation characters
      const hasComma = v.value[0] === ',' ? 'noSpace' : '';

      return (
        <span key={`_${v.value}`} className={`${v.type} ${ingClassName} ${hasComma}`}>
          {v.value}
        </span>
      );
    })
  }

  function renderBlock(index: number) {
    const blockIngredients = ingredients.filter((i) => i.blockIndex === index);

    return blockIngredients.map((line, lineIndex) =>
      <IngredientListItem key={`parsed_ingredient_block_${index}_${line?.id ?? lineIndex}`}>
        {
          line.isParsed && line?.parsed
            ? (
              <Parsed>
                {renderParsed(`${index}${line.id}_${line.blockIndex}_${line.lineIndex}`, line.parsed)}
              </Parsed>
            ): <span className='unparsed'>{line.reference}</span>
        }
      </IngredientListItem>
    );
  }

  function renderIngredients() {
    return ingBlocks.map((blockIndex) =>
      <Block key={`parsed_ingredient_block${blockIndex}`} className='block'>
        {renderBlock(blockIndex)}
      </Block>
    )
  }

  return (
    <IngredientList>
      {renderIngredients()}
    </IngredientList>
  )
};

type InstructionsProps = {
  instructions: InstructionLine[]
};
const Instructions: React.FC<InstructionsProps> = ({ instructions }) => {
  function renderIngredients() {
    return instructions.map((instruction) =>
      <InstructionListItem key={`parsed_instruction_${instruction.id}`}>
        {instruction.reference}
      </InstructionListItem>)
  }

  return (
    <InstructionList>
      {renderIngredients()}
    </InstructionList>
  )
};

const ParsedNote: React.FC<ParsedNotePageProps> = ({ note }) => {
  return (
    <Wrapper>
      {/* Title */}
      <Title>{note.title}</Title>

      {/* Content */}
      <ContentStyles>
        <Ingredients ingredients={note.ingredients} />
        <Instructions instructions={note.instructions} />
      </ContentStyles>
    </Wrapper>
  );
};

export default ParsedNote;
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
        color: ${ ({ theme }) => theme.colors.altGreen };
      }
    }
  }
`;

const IngredientList = styled.ul`
  &&& {
    margin-top: 20px;
  }
`;

const InstructionList = styled.ul`
`;

const IngredientListItem = styled.li`
  margin-bottom: 2px;

  &:last-of-type {
    margin-bottom: 12px;
  }
`;

const InstructionListItem = styled.li`
  margin-bottom: 12px;
`;

const Wrapper = styled.div`
  margin: 20px 0;
  max-width: 850px;

  background: ${({ theme }) => theme.colors.headerBackground};
  padding: 24px;
  margin: 20px 0;
  max-width: 850px;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;

  position: relative;
  overflow: hidden;
`;

const Title = styled.h2`
  font-weight: normal;
  font-size: 18px;
  font-weight: 300;
  margin: 0;
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
