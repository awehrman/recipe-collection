import React from 'react';
import styled from 'styled-components';

import AlternateNames from './fields/alternate-names';
import RelatedIngredients from './fields/related-ingredients';
import Substitutes from './fields/substitutes';
import References from './fields/references';

const RelationalFields = () => {
  return (
    <Wrapper>
      {/* Alternate Names */}
      <AlternateNames />

      {/* Related Ingredients */}
      <RelatedIngredients />

      {/* Substitutes */}
      <Substitutes />

      {/* References */}
      <References />
    </Wrapper>
  )
}

export default RelationalFields;

const Wrapper = styled.div`
  // background: purple;
  flex-basis: 100%;
`;
