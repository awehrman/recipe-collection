import Evernote from 'evernote';
import { IncomingMessage } from 'http';
import { getSession } from 'next-auth/client';

import { AuthenticationResponse } from '../../../types/evernote';

export const client = new Evernote.Client({
  consumerKey: process.env.API_CONSUMER_KEY,
  consumerSecret: process.env.API_CONSUMER_SECRET,
  sandbox: process.env.EVERNOTE_ENVIRONMENT === 'sandbox',
  china: false,
});

export const isAuthenticated = async (
  req: IncomingMessage
): Promise<boolean> => {
  const session = await getSession({ req });
  const { evernoteAuthToken, evernoteExpiration } = session?.user ?? {};
  const isExpired = !!(Date.now() > parseInt(`${evernoteExpiration}`));
  const isAuthenticated = !!(evernoteAuthToken && !isExpired);
  return isAuthenticated;
};

export const requestEvernoteAuthToken = (
  evernoteReqToken?: string,
  evernoteReqSecret?: string,
  oauthVerifier?: string
): Promise<AuthenticationResponse> =>
  new Promise((resolve, reject) => {
    type ResultsProps = {
      edam_expires?: string;
    };
    const cb = (
      err: unknown,
      evernoteAuthToken: string,
      _secret: string,
      results: ResultsProps
    ) => {
      if (err) {
        reject(err);
      }
      resolve({
        evernoteAuthToken,
        evernoteExpiration: `${results?.edam_expires}`,
      });
    };
    client.getAccessToken(
      `${evernoteReqToken}`,
      `${evernoteReqSecret}`,
      `${oauthVerifier}`,
      cb
    );
  });

export const requestEvernoteRequestToken =
  (): Promise<AuthenticationResponse> =>
    new Promise((resolve, reject) => {
      const cb = (
        err: unknown,
        evernoteReqToken: string,
        evernoteReqSecret: string
      ) => {
        if (err) {
          reject(err);
        }
        resolve({ evernoteReqToken, evernoteReqSecret });
      };
      client.getRequestToken(`${process.env.OAuthCallback}`, cb);
    });

export default {
  client,
  isAuthenticated,
  requestEvernoteAuthToken,
  requestEvernoteRequestToken,
};
