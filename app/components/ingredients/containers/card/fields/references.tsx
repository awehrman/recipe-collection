import React, { useContext } from 'react';
import styled from 'styled-components';

import useIngredient from '../../../../../hooks/use-ingredient';
import CardContext from '../../../../../contexts/card-context';

const References = () => {
  const { id, isEditMode } = useContext(CardContext);
  const { ingredient } = useIngredient({ id });
  const { references } = ingredient;

  return (
    <Wrapper>
      {JSON.stringify(references)}
    </Wrapper>
  )
}

export default References;

const Wrapper = styled.div`
`;
