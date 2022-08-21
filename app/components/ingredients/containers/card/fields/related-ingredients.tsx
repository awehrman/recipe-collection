import React, { useContext } from 'react';
import styled from 'styled-components';

import useIngredient from 'hooks/use-ingredient';
import CardContext from 'contexts/card-context';

const RelatedIngredients = () => {
  const { id, isEditMode } = useContext(CardContext);
  const { ingredient } = useIngredient({ id });
  const { relatedIngredients } = ingredient;

  return (
    <Wrapper>
      {/* TODO */}
    </Wrapper>
  )
}

export default RelatedIngredients;

const Wrapper = styled.div`
`;
