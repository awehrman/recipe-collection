import React from 'react';
import styled from 'styled-components';

import { Ingredient } from '../../../types/ingredient';

import List from './list';
import CardList from './card-list';

type ContainerProps = {
  container: {
    id: string;
    name: string;
    count: number;
    currentIngredientId: string;
    isExpanded: boolean;
    ingredients: Ingredient[];
  };
  onClick: unknown;
};

const Container: React.FC<ContainerProps> = ({
  container,
  onContainerClick,
  onIngredientClick,
}) => {
  return (
    <Wrapper>
      {/* Container Header */}
      <Header onClick={() => onContainerClick(container.id)}>
        {container.name}
        <Count>{container.count}</Count>
      </Header>

      {/* Ingredients */}
      <Ingredients className={container.isExpanded ? 'expanded' : ''}>
        {container.currentIngredientId ? (
          <CardList container={container} onIngredientClick={onIngredientClick} />
        ) : (
          <List container={container} onIngredientClick={onIngredientClick} />
        )}
      </Ingredients>
    </Wrapper>
  );
};

export default Container;

const Wrapper = styled.div`
  width: 100%;
  position: relative;
  max-width: 1200px;
`;

const Header = styled.div`
  flex-basis: 100%;
  font-size: 1.2em;
  padding: 12px 0;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
`;

const Count = styled.span`
  color: ${({ theme }) => theme.colors.lighterGrey};
  text-align: right;
`;

const Ingredients = styled.div`
  display: none;

  &.expanded {
    flex-wrap: wrap;
    display: flex;
  }
`;
