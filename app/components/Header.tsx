import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { signOut, useSession } from 'next-auth/client'

const Header: React.FC = () => {
  const router = useRouter()
  const isActive: (pathname: string) => boolean = (pathname) =>
    router.pathname === pathname

  const [session] = useSession()

  return (
    <nav>
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
    </nav>
  )
}

export default Header