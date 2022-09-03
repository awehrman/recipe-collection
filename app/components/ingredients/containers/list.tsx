import React from 'react';
import styled from 'styled-components';

import ListItem from './list-item';

// TODO virtualize this
const List = ({ container, onIngredientClick }) => {
  const { id, ingredients = [] } = container;

  function renderIngredientColumns() {
    return ingredients.map((ingredient, index) => (
      <ListItem
        key={`columns_${id}_${ingredient.id}`}
        container={container}
        ingredient={ingredient}
        index={index}
        onIngredientClick={onIngredientClick}
      />
    ));
  }

  return (
    <Columns className={container.currentIngredientId ? 'expanded' : ''}>
      {renderIngredientColumns()}
    </Columns>
  );
};

export default List;

const Columns = styled.ul`
  max-height: 235px;
  overflow-x: scroll;
  display: block;
  flex-basis: 100%;
  margin: 0;
  list-style-type: none;
  line-height: 1.4;
  overflow: scroll;
  position: relative;
  padding: 5px 0;
  border-bottom: 1px solid #ddd;
  padding-left: 2px; /* give some space for outline */

  a {
    cursor: pointer;
    text-decoration: none;
    color: #222;
    display: inline-block; /* need to give these links height for the scroll! */

    &:hover {
      color: ${({ theme }) => theme.colors.highlight};
    }
  }

  &.expanded {
    order: 1;
  }

  &.small {
    display: flex;
    align-items: start;
  }

  @media (min-width: 500px) {
    column-count: 2;
    column-gap: 16px;
  }

  @media (min-width: 700px) {
    column-count: 3;
  }

  @media (min-width: ${({ theme }) => theme.sizes.desktopCardWidth}) {
    padding: 10px 0;
    max-height: 500px;

    /* swing the ingredient list over to the left */
    &.expanded {
      column-count: unset;
      flex-basis: 200px;
      order: 0;
    }
  }

  @media (min-width: 900px) {
    column-count: 4;
  }

  @media (min-width: 1100px) {
    column-count: 5;
  }
`;
