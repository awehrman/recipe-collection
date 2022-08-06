import React, { useContext, useRef } from 'react';
import { FixedSizeList } from 'react-window';
import styled from 'styled-components';

import ViewContext from '../../../contexts/view-context';

import ListItem from './list-item';
import Card from './card';

const CardList = ({ container, onIngredientClick }) => {
  const { group, view } = useContext(ViewContext);
  const listRef = useRef(null);
  const { currentIngredientId = null, id, ingredients = [] } = container;

  function rowRenderer({ data, index, style }) {
    const ingredient = data[index]
    const { id, isValidated, hasParent, name } = ingredient;
		const ingClassName = [];
		if (!isValidated) ingClassName.push('invalid');
		if (hasParent) ingClassName.push('child');
		if (id === container?.ingredientID) ingClassName.push('active');
    
    return (
      <Row key={`card-list_${id}_${ingredient.id}`} style={style}>
        <ListItem
          container={container}
          ingredient={ingredient}
          index={index}
          listRef={listRef}
          onIngredientClick={onIngredientClick}
        />
      </Row>
    )
  }

  return (
    <Wrapper>
      {/* Ingredients List */}
      <SideList
        className={currentIngredientId ? 'expanded' : ''}
        ref={listRef}
        height={500} // TODO
        itemCount={ingredients.length}
        itemData={ingredients}
        itemSize={22}
        width={180} // TODO
      >
        {rowRenderer}
      </SideList>
      
      {/* Ingredient Card */}
      <Card id={currentIngredientId}/>
    </Wrapper>
  );
};

export default CardList;

const Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
`;
const Row = styled.div``;

const SideList = styled(FixedSizeList)`
  max-height: 235px;
  overflow-x: scroll;
  display: block;
  flex-basis: 150px;
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
