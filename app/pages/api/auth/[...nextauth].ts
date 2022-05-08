import { NextApiHandler } from 'next'
import NextAuth, { Session } from 'next-auth'
import Providers from 'next-auth/providers'
import Adapters from 'next-auth/adapters'

import prisma from '../../../lib/prisma'

const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, options);
export default authHandler;

type UserProps = {
  id?: number;
  authURL?: string;
  evernoteExpiration?: string;
  evernoteAuthToken?: string;
  evernoteReqToken?: string;
  evernoteReqSecret?: string;
  role?: string;
  noteImportOffset?: number;
}

type TokenProps = {
  id?: number;
  authURL?: string;
  evernoteAuthToken?: string;
  evernoteReqToken?: string;
  evernoteReqSecret?: string;
  userId?: number;
  noteImportOffset?: number;
  evernoteExpiration?: string;
}

const options = {
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  adapter: Adapters.Prisma.Adapter({ prisma }),
  secret: process.env.SECRET,
  callbacks: {
    async session(session: Session, token: TokenProps) {
      // for whatever reason these don't always populate client side
      // we'll just query these values once we have the userId set
      // session.user.evernoteAuthToken = token.evernoteAuthToken;
      session.user.evernoteReqToken = token.evernoteReqToken;
      session.user.evernoteReqSecret = token.evernoteReqSecret;
      // session.user.evernoteExpiration = token.evernoteExpiration;
      // session.user.noteImportOffset = token?.noteImportOffset || 0;
      session.user.userId = token.id;

      return session;
    },
    async signIn(user: UserProps) {
      const { role } = user;
      const isAllowedToSignIn = role === 'ADMIN' || role === 'USER';
      if (isAllowedToSignIn) {
        return true;
      } else {
        // Return false to display a default error message
        return false;
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
      }
    }
  }
}