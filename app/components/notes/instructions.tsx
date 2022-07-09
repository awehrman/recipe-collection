import styled, { keyframes } from 'styled-components';
import React from 'react';

import { InstructionLine } from '../../types/ingredient';
import { StatusProps } from '../../types/note';

type InstructionsProps = {
  instructions: InstructionLine[];
  status: StatusProps;
};

const Instructions: React.FC<InstructionsProps> = ({
  instructions = [],
  status,
}) => {
  function renderIngredients(status: StatusProps) {
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

export default Instructions;

const loading = keyframes`
  0% {
    background: rgba(238, 238, 238, 1);
  }
  100% {
    background: rgba(230, 230, 230, 1);
  }
`;

const InstructionList = styled.ul``;

const InstructionListItem = styled.li`
  margin-bottom: 12px;

  &.loading {
    border-radius: 5px;
    animation: ${loading} 1s linear infinite alternate;
    width: 100%;
    border-radius: 5px;
    height: 13px;
    margin: 5px 0 8px;
  }
`;
