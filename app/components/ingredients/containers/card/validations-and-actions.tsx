import React, { useContext } from 'react';
import styled from 'styled-components';

import CardContext from '../../../../contexts/card-context';

const ValidationsAndActions = () => {
  const { id, isEditMode, setIsEditMode } = useContext(CardContext);

  return (
    <Wrapper>
      Warning
      {/* Warnings */}

      {/* Edit Button */}

      {/* Save Button */}

      {/* Cancel Button */}
    </Wrapper>
  )
}

export default ValidationsAndActions;

const Wrapper = styled.div`
  // background: aqua;
`;
