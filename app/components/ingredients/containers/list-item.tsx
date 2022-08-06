import Link from 'next/link';
import React, { useContext } from 'react';
import styled from 'styled-components';

import ViewContext from '../../../contexts/view-context';

const ListItem = ({ container, ingredient, index, onIngredientClick }) => {
  const { group, view } = useContext(ViewContext);
  const { id } = container;

  function handleIngredientClick(event: Event, ingredientId: string, _index: number) {
    event.stopPropagation();

    // TODO scroll to element in list

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
    <Wrapper>
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

const Wrapper = styled.div``;

const IngredientLink = styled(Link)`
  + .active {
    display: inline-block;
    background: rgba(128, 174, 245, 0.08);
    width: 100%;
  }

  + .child a {
    font-style: italic;
  }

  &.invalid > a {
    color: silver;
  }
`;
