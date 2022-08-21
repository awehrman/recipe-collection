import React from 'react';
import styled from 'styled-components';

import List from './common/list';

const Substitutes = () => {
  return (
    <Wrapper>
      <List
        fieldName="substitutes"
        label="Substitutes"
      />
    </Wrapper>
  )
}

export default Substitutes;

const Wrapper = styled.div`
`;
