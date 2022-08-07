import React, { useContext } from 'react';
import styled from 'styled-components';

import useIngredient from '../../../../../hooks/use-ingredient';
import CardContext from '../../../../../contexts/card-context';

const isComposedIngredient = () => {
  const { id, isEditMode } = useContext(CardContext);
  const { ingredient } = useIngredient({ id });
  const { isComposedIngredient } = ingredient;

  return (
    <Wrapper>
      {/* TODO */}
    </Wrapper>
  )
}

export default isComposedIngredient;

const Wrapper = styled.div`
`;
