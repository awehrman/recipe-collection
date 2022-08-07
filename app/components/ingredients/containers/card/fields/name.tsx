import React, { useContext } from 'react';
import styled from 'styled-components';

import useIngredient from '../../../../../hooks/use-ingredient';
import CardContext from '../../../../../contexts/card-context';

const Name = () => {
  const { id, isEditMode } = useContext(CardContext);
  const { ingredient } = useIngredient({ id });
  const { name } = ingredient;

  return (
    <Wrapper>
      {name}
    </Wrapper>
  )
}

export default Name;

const Wrapper = styled.div`
`;
