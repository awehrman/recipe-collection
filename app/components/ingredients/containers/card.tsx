import ingredient from 'constants/ingredient';
import React from 'react';
import styled from 'styled-components';

const Card = ({ id }) => {
  // TODO
  return (
    <CardWrapper>
      {id}
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

