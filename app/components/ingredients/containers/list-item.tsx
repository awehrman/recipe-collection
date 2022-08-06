import Link from 'next/link';
import React, { useContext } from 'react';
import styled from 'styled-components';

import ViewContext from '../../../contexts/view-context';

const ListItem = ({ container, ingredient, index, onIngredientClick, listRef }) => {
  const { group, view } = useContext(ViewContext);
  const { currentIngredientId } = container;
  const isValid = !ingredient.isValidated ? 'invalid' : ''; // TODO include in ingredient res
  const isChild = ingredient.hasParent ? 'child' : ''; // TODO include in ingredient res
  const isActive = `${ingredient.id}` === `${currentIngredientId}` ? 'active' : '';
  const className = `${isValid} ${isChild} ${isActive}`;
  console.log(className);

  function handleIngredientClick(event: Event, ingredientId: string, index: number) {
    event.stopPropagation();

    // scroll to element in list
    if (listRef?.current) {
      listRef.current.scrollToItem(index - 1, 'start');
    }

    // TODO consider passing the currentIngId to this mutation
    // and let the resolver do this logic
    const showHideIngredientId =
      `${container.currentIngredientId}` === `${ingredientId}`
        ? null
        : `${ingredientId}`;

    onIngredientClick(`${container.id}`, showHideIngredientId);
  }

  function getIngredientLink(_id: string) {
    const { currentIngredientId } = container;
    const query = {
      group,
      view,
    };
    if (currentIngredientId !== _id) {
      query.id = _id;
    }
    return { pathname: '/ingredients', query };
  }

  return (
    <Wrapper className={className}>
      <IngredientLink href={getIngredientLink(ingredient.id)}>
        <a
          onClick={(e: Event) => handleIngredientClick(e, ingredient.id, index)}
          onKeyPress={handleIngredientClick}
          role="link"
          tabIndex={0}
        >
          {ingredient.name}
        </a>
      </IngredientLink>
    </Wrapper>
  );
};

export default ListItem;

const Wrapper = styled.div`
  &.active {
    display: inline-block;
    background: rgba(128, 174, 245, 0.08);
    width: 100%;
    color: #222;
  }

  &.child {
    font-style: italic;
  }

  &.invalid {
    color: silver;
  }
`;

const IngredientLink = styled(Link)`
`;
