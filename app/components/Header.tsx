import React from 'react';
import styled from 'styled-components'

export type HeaderProps = {
  title: string;
};

const Header: React.FC<HeaderProps>= ({ title = '' }) => (
  <HeaderStyles>
    <h1>{title}</h1>
  </HeaderStyles>
)

export default Header

const HeaderStyles = styled.div`
  background: ${({ theme }) => theme.colors.headerBackground};
  margin: 0;
  display: flex;
  align-items: center;
  padding: 40px;
  height: 100px;

  h1 {
    margin: 0;
    font-weight: 300;
    font-size: 2em;
    color: ${({ theme }) => theme.colors.headerColor};
  }
`;
