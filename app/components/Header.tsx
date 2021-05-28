import React from 'react';
import { signOut } from 'next-auth/client'
import styled from 'styled-components'

export type HeaderProps = {
  title: string;
};

const Header: React.FC<HeaderProps>= ({ title = '' }) => {


  return (
    <Title>
      <h1>{title}</h1>
      <button onClick={() => signOut()}>
        <a>Log out</a>
      </button>
    </Title>
  )
}

export default Header

const Title = styled.h1`
  color: red;
`;