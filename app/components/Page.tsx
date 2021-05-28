import React, { useContext, useState } from 'react';
import styled, { ThemeContext } from 'styled-components';
import Link from 'next/link'
import { useRouter } from 'next/router'

import { useSession } from 'next-auth/client'

import Nav from './Nav';
import Header from './Header';

export type PageProps = {
  title: string;
  children: React.ReactNode;
};

const Page: React.FC<PageProps>  = ({ title, children }) => {
  const router = useRouter();
  const [session] = useSession()
  const themeContext = useContext(ThemeContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const isActive: (_pathname: string) => boolean = (pathname) =>
    router?.pathname === pathname;

  return (
    <Canvas theme={themeContext}>
      {!session
        ? (
          <SignUp>
            <Link href='/api/auth/signin'>
              <a data-active={isActive('/signup')}>Log in</a>
            </Link>
          </SignUp>
        ) : (
          <Wrapper theme={themeContext} isExpanded={isExpanded}>
            <Nav isExpanded={isExpanded} />
            <Content>
              <Header title={title} setIsExpanded={setIsExpanded} />
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

const Content = styled.div`
  border: 2px solid purple;
`;

type WrapperProps = {
  isExpanded: boolean;
}

const Wrapper = styled.div<WrapperProps>`
  border: 2px solid gold;
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
		left: ${ ({ theme, isExpanded }) => isExpanded ? theme.sizes.menuOffset : theme.sizes.minMenuWidth };

		section {
			margin-right: 40px;
		}
	}
`;
