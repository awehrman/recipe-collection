// eslint-disable-next-line no-unused-vars
import NextAuth, { DefaultSession } from 'next/auth';
declare module "next-auth" {
  interface Session {
    user: {
      evernoteAuthToken?: string;
      evernoteReqToken?: string;
      evernoteReqSecret?: string;
      userId?: number;
      evernoteExpiration?: string;
      noteImportOffset?: number;
    } & DefaultSession["user"]
  }

  interface User {
    evernoteAuthToken?: string;
    evernoteReqToken?: string;
    evernoteReqSecret?: string;
    userId?: number;
    evernoteExpiration?: string;
    noteImportOffset?: number;
  }
}