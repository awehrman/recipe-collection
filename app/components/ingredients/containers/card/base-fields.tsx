import React, { useContext } from 'react';
import styled from 'styled-components';

import useIngredient from '../../../../hooks/use-ingredient';
import CardContext from '../../../../contexts/card-context';

const BaseFields = () => {
  const { id, isEditMode } = useContext(CardContext);
  const { ingredient } = useIngredient({ id });
  const { name, plural, properties, isComposedIngredient } = ingredient;

  return (
    <Wrapper>
      {/* Name */}
      {name}

      {/* Plural */}

      {/* Properties */}

      {/* Is Composed Ingredient */}
    </Wrapper>
  )
}

export default BaseFields;

const Wrapper = styled.div`
  background: yellow;
`;
