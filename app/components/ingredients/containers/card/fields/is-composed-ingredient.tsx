import React, { useContext } from 'react';
import styled from 'styled-components';

import useIngredient from 'hooks/use-ingredient';
import CardContext from 'contexts/card-context';

const isComposedIngredient = () => {
  const { id, isEditMode } = useContext(CardContext);
  const { ingredient } = useIngredient({ id });
  const { isComposedIngredient } = ingredient;

  return (
    <Wrapper>
      {/* TODO */}
      Is Composed Ingredient?
    </Wrapper>
  )
}

export default isComposedIngredient;

const Wrapper = styled.div`
  order: 4;
  flex-basis: 50%;
  flex-grow: 2;
  text-align: right;
`;
