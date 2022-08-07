import React, { useContext } from 'react';
import styled from 'styled-components';

import useIngredient from '../../../../../hooks/use-ingredient';
import CardContext from '../../../../../contexts/card-context';

const AlternateNames = () => {
  const { id, isEditMode } = useContext(CardContext);
  const { ingredient } = useIngredient({ id });
  const { alternateNames } = ingredient;

  return (
    <Wrapper>
      {JSON.stringify(alternateNames)}
    </Wrapper>
  )
}

export default AlternateNames;

const Wrapper = styled.div`
`;
