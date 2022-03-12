import { useSession } from 'next-auth/client'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useContext, useState } from 'react';
import styled, { ThemeContext } from 'styled-components';

import Header from './Header';
import Nav from './Nav';

export type PageProps = {
  title: string;
  children: React.ReactNode;
};

const Page: React.FC<PageProps>  = ({ title, children }) => {
  const router = useRouter();
  const [session /*, loading*/ ] = useSession();
  const themeContext = useContext(ThemeContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const isActive: (_pathname: string) => boolean = (pathname) => router?.pathname === pathname;

  return (
    <Canvas theme={themeContext}>
      {!session
        ? (
          <SignUp>
            <Link href='/api/auth/signin'>
              <a data-r={isActive('/signup')}>Log in</a>
            </Link>
          </SignUp>
        ) : (
          <Wrapper theme={themeContext} isExpanded={isExpanded}>
            <Nav isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
            <Header title={title} />
            <Content>
              { children }
            </Content>
          </Wrapper>
        )
      }
    </Canvas>
  );
  }

export default Page;

const SignUp = styled.div`
  position: relative;
  top: 40%;
  display: flex;
  justify-content: center;

  a {
    text-decoration: none;
    font-size: 20px;
    color: ${ ({ theme }) => theme.colors.altGreen };
    font-weight: bold;
    padding: 10px;

    &:hover, &:focus {
      outline: 2px dotted ${ ({ theme }) => theme.colors.altGreen };
    }
  }
`;

const Canvas = styled.div`
	position: absolute;
	overflow-x: hidden;
	width: 100%;
	height: 100%;
  background: ${ ({ theme }) => theme.colors.headerBackground };
`;

const Content = styled.article`
  padding: 20px 40px;
  background: white;
  height: 100%;
  color: ${ ({ theme }) => theme.colors.bodyText };
  font-size: 16px;
  font-family: 'Source Sans Pro', Verdana, sans-serif;
`;

type WrapperProps = {
  isExpanded: boolean;
}

const Wrapper = styled.div<WrapperProps>`
  overflow-x: scroll;
	position: relative;
	top: ${ ({ theme }) => theme.sizes.minMenuWidth };
	left: 0;
	transition: .2s ease-out;
	width: 100%;
	height: 100%;

	section {
		padding: 20px 40px;
		background: white;
	}

	@media (min-width: ${ ({ theme }) => theme.sizes.tablet }) {
		top: 0;
		left: ${ ({ theme, isExpanded }) => isExpanded ? theme.sizes.menuWidth : theme.sizes.minMenuWidth };
    width: calc(100% - 40px);
  }
`;
