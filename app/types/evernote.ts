import { Note } from './note';

export type AuthenticateEvernoteArgs = {
  oauthVerifier?: string;
};

export type AuthenticationResponse = {
  authURL?: string;
  errorMessage?: string;
  isAuthPending?: boolean;
  isAuthenticated?: boolean;
  evernoteAuthToken?: string;
  evernoteReqToken?: string;
  evernoteReqSecret?: string;
  evernoteExpiration?: string;
};

export type EvernoteResponse = {
  error?: string;
  notes?: Note[];
};
