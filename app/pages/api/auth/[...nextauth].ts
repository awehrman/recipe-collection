import { NextApiHandler } from 'next'
import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'
import Adapters from 'next-auth/adapters'
import prisma from '../../../lib/prisma'

const authHandler: NextApiHandler = (req, res) => NextAuth(req, res, options);
export default authHandler;

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
    async session(session, token) {
      // add in evernote access tokens
      session.userId = token.id;
      session.evernoteAuthToken = token.evernoteAuthToken;
      session.evernoteReqToken = token.evernoteReqToken;
      session.evernoteExpiration = token.evernoteExpiration;
      return session
    },
    async signIn(user) {
      const { role } = user;
      const isAllowedToSignIn = role === 'ADMIN' || role === 'USER';
      console.log('**', { user });
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