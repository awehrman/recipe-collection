import { Session } from 'next-auth';
import { getSession } from 'next-auth/client';

import {
  AuthenticateEvernoteArgs,
  AuthenticationResponse,
} from '../../types/evernote';
import { SessionUserProps } from '../../types/session';

import { PrismaContext } from '../context';

import {
  client,
  requestEvernoteAuthToken,
  requestEvernoteRequestToken,
} from './helpers/authenticate-evernote';

export const resolveAuthenticateEvernote = async (
  _root: unknown,
  args: AuthenticateEvernoteArgs,
  ctx: PrismaContext
): Promise<AuthenticationResponse> => {
  const { oauthVerifier } = args;
  const { prisma, req } = ctx;
  const session: Session | null = await getSession({ req });

  const user: SessionUserProps = session?.user || {};
  const { evernoteReqToken, evernoteReqSecret, userId } = user;
  const id = Number(userId);

  const response = {
    errorMessage: '',
    isAuthPending: false,
    isAuthenticated: false,
    authURL: '',
    evernoteExpiration: '',
  };

  if (id < 1 || id === null || id === undefined || isNaN(id)) {
    response.errorMessage = 'No userId in session';
    return response;
  }

  if (!evernoteReqToken) {
    try {
      const { evernoteReqToken, evernoteReqSecret } =
        await requestEvernoteRequestToken();
      response.authURL = evernoteReqToken
        ? client.getAuthorizeUrl(evernoteReqToken)
        : '';
      response.isAuthPending = !!response.authURL.length;

      await prisma.user.update({
        data: { evernoteReqToken, evernoteReqSecret },
        where: { id },
      });
    } catch (err: unknown) {
      console.log({ err });
      response.errorMessage = JSON.stringify(err, null, 2);
    }
  }

  if (oauthVerifier && evernoteReqToken && evernoteReqSecret) {
    try {
      const { evernoteAuthToken, evernoteExpiration } =
        await requestEvernoteAuthToken(
          `${evernoteReqToken}`,
          `${evernoteReqSecret}`,
          `${oauthVerifier}`
        );
      response.isAuthenticated = !!evernoteAuthToken;

      await prisma.user.update({
        data: { evernoteAuthToken, evernoteExpiration },
        where: { id },
      });
    } catch (err: unknown) {
      console.log({ err });
      response.errorMessage = `${err}`;
    }
  }
  return response;
};

export const resolveClearAuthentication = async (
  _root: unknown,
  _args: AuthenticateEvernoteArgs,
  ctx: PrismaContext
): Promise<AuthenticationResponse> => {
  const { req } = ctx;
  const session: Session | null = await getSession({ req });
  const { user } = session || {};
  const id = Number(user?.userId ?? 0);

  const response: AuthenticationResponse = {};

  try {
    await ctx.prisma.user.update({
      data: {
        evernoteAuthToken: null,
        evernoteReqToken: null,
        evernoteReqSecret: null,
        evernoteExpiration: null,
      },
      where: { id },
    });
  } catch (err: unknown) {
    console.log({ err });
    response.errorMessage = `${err}`;
  }
  return response;
};

export default {
  resolveAuthenticateEvernote,
  resolveClearAuthentication,
};
