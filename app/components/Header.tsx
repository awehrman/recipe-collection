import React from 'react';
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signOut, useSession } from 'next-auth/client'
import styled from 'styled-components'

const Header: React.FC = ({ title = ''}) => {
  const router = useRouter()
  const isActive: (pathname: string) => boolean = (pathname) =>
    router.pathname === pathname

  const [session] = useSession()

  return (
    <Title>
      <h1>{title}</h1>
      <p>{session?.user?.name}</p>
      {
        !session
          ? (
            <Link href="/api/auth/signin">
              <a data-active={isActive('/signup')}>Log in</a>
            </Link>
          ) : (
            <button onClick={() => signOut()}>
              <a>Log out</a>
            </button>
          )
      }
    </Title>
  )
}

export default Header

const Title = styled.h1`
  color: red;
`;