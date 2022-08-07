import React, { useContext } from 'react';
import styled from 'styled-components';

import useIngredient from '../../../../../hooks/use-ingredient';
import CardContext from '../../../../../contexts/card-context';

const Properties = () => {
  const { id, isEditMode } = useContext(CardContext);
  const { ingredient } = useIngredient({ id });
  const { properties } = ingredient;

  return (
    <Wrapper>
      {JSON.stringify(properties)}
    </Wrapper>
  )
}

export default Properties;

const Wrapper = styled.div`
`;
