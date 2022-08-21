import React, { useContext } from 'react';
import styled from 'styled-components';

import useIngredient from 'hooks/use-ingredient';
import CardContext from 'contexts/card-context';

import AlternateNames from './fields/alternate-names';
import RelatedIngredients from './fields/related-ingredients';
import Substitutes from './fields/substitutes';
import References from './fields/references';

const RelationalFields = () => {
  const { id, isEditMode } = useContext(CardContext);
  const { ingredient } = useIngredient({ id });
  const { alternateNames = [], relatedIngredients = [], substitutes = [] } = ingredient;
  const showLeftColumn = isEditMode || 
    (alternateNames.length && relatedIngredients.length && substitutes.length);

  return (
    <Wrapper>
      {showLeftColumn ? (
        <Left>
          {/* Alternate Names */}
          <AlternateNames />

          {/* Related Ingredients */}
          <RelatedIngredients />

          {/* Substitutes */}
          <Substitutes />
        </Left>
      ) : null}

      {/* References */}
      <References />
    </Wrapper>
  )
}

export default RelationalFields;

const Wrapper = styled.div`
  display: flex;
  height: 100%;
  flex-wrap: wrap;
`;

const Left = styled.div`
  flex-basis: 50%;
  flex-shrink: 2;
`;
