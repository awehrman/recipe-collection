import ingredient from 'constants/ingredient';
import React from 'react';
import styled from 'styled-components';

import useIngredient from '../../../hooks/use-ingredient';

const Card = ({ id }) => {
  const { ingredient, loading } = useIngredient({ id });
  const { name } = ingredient;

  return (
    <CardWrapper>
      {loading && 'loading...'}
      {!loading && (
        <>
        {name}
        </>
      )}
    </CardWrapper>
  )
}

export default Card;

const CardWrapper = styled.div`
  display: flex;
  order: 0;
  flex-basis: 100%;
  min-height: 350px;

  @media (min-width: ${({ theme }) => theme.sizes.desktopCardWidth}) {
    min-height: 500px;
    order: 2;
    flex-basis: calc(100% - 200px);
  }
`

