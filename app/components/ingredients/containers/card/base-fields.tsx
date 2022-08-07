import React, { useContext } from 'react';
import styled from 'styled-components';

import Name from './fields/name';
import Plural from './fields/plural';
import Properties from './fields/properties';
import IsComposedIngredient from './fields/is-composed-ingredient';

const BaseFields = () => {
  return (
    <Wrapper>
      {/* Name */}
      <Name />

      {/* Plural */}
      <Plural />

      {/* Properties */}
      <Properties />

      {/* Is Composed Ingredient */}
      <IsComposedIngredient />
    </Wrapper>
  )
}

export default BaseFields;

const Wrapper = styled.div`
  @media (min-width: ${({ theme }) => theme.sizes.desktopCardWidth }) {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20px;

    .left {
			flex-grow: 1;
		}

		.right {
			text-align: right;
			flex-shrink: 2;
    }
  }
`;
