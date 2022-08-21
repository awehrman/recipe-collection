import React from 'react';
import styled from 'styled-components';

import List from './common/list';

const References = () => {
  return (
    <Wrapper>
      <List
        fieldName="references"
        label="References"
      />
    </Wrapper>
  )
}

export default References;

const Wrapper = styled.div`
  flex-grow: 2;
`;
