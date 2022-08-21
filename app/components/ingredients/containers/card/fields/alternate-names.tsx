import React from 'react';
import styled from 'styled-components';

import List from './common/list';

const AlternateNames = () => {
  return (
    <Wrapper>
      <List
        fieldName="alternateNames"
        label="Alternate Names"
      />
    </Wrapper>
  )
}

export default AlternateNames;

const Wrapper = styled.div``;
