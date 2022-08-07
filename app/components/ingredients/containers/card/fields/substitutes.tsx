import React, { useContext } from 'react';
import styled from 'styled-components';

import useIngredient from '../../../../../hooks/use-ingredient';
import CardContext from '../../../../../contexts/card-context';

const Substitutes = () => {
  const { id, isEditMode } = useContext(CardContext);
  const { ingredient } = useIngredient({ id });
  const { substitutes } = ingredient;

  return (
    <Wrapper>
      {JSON.stringify(substitutes)}
    </Wrapper>
  )
}

export default Substitutes;

const Wrapper = styled.div`
`;
