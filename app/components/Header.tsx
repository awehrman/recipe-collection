import React from 'react';
import { signOut } from 'next-auth/client'
import styled from 'styled-components'

import Button from './common/Button';

export type HeaderProps = {
  title: string;
};

const Header: React.FC<HeaderProps>= ({ title = '' }) => (
  <HeaderStyles>
    <h1>{title}</h1>
    <Button className='sign-out' label='Sign Out' onClick={() => signOut()} />
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

  button.sign-out {
    display: flex;
    justify-content: flex-end;
    border: 0;
    color: ${({ theme }) => theme.colors.headerColor};
    font-weight: bold;
    background: transparent;
    flex-basis: 100%;
    margin-right: 40px;

    &:hover, &:focus {
      color: ${({ theme }) => theme.colors.altGreen};
    }
  }
`;
