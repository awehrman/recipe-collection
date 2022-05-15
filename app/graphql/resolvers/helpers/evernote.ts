import { getSession } from 'next-auth/client';
import { IncomingMessage } from 'http';

export const isAuthenticated = async (req: IncomingMessage): Promise<boolean> => {
  const session = await getSession({ req });
  const { evernoteAuthToken, evernoteExpiration } = session?.user ?? {};
  const isExpired = !!(Date.now() > parseInt(`${evernoteExpiration}`));
  const isAuthenticated = !!(evernoteAuthToken && !isExpired);
  return isAuthenticated;
};

export default {
  isAuthenticated
};