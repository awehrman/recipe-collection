import React, { useContext } from 'react';
import styled from 'styled-components';

import CardContext from '../../../../contexts/card-context';

const RelationalFields = () => {
  const { id, isEditMode, setIsEditMode } = useContext(CardContext);

  return (
    <Wrapper>
      Relational
      {/* Alternate Names */}

      {/* Related Ingredients */}

      {/* Substitutes */}

      {/* References */}
    </Wrapper>
  )
}

export default RelationalFields;

const Wrapper = styled.div`
  background: purple;
  flex-basis: 100%;
`;
