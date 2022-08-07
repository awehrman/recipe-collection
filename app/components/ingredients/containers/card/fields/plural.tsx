import React, { useContext } from 'react';
import styled from 'styled-components';

import useIngredient from '../../../../../hooks/use-ingredient';
import CardContext from '../../../../../contexts/card-context';

const Plural = () => {
  const { id, isEditMode } = useContext(CardContext);
  const { ingredient } = useIngredient({ id });
  const { plural } = ingredient;

  return (
    <Wrapper>
      {/* TODO */}
    </Wrapper>
  )
}

export default Plural;

const Wrapper = styled.div`
`;
