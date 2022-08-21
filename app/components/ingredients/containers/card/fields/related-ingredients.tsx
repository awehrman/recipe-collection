import React from 'react';
import styled from 'styled-components';

import List from './common/list';

const RelatedIngredients = () => {
  return (
    <Wrapper>
      <List
        fieldName="relatedIngredients"
        label="Related Ingredients"
      />
    </Wrapper>
  )
}

export default RelatedIngredients;

const Wrapper = styled.div``;
