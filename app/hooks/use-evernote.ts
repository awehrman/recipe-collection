import { useQuery, useMutation } from '@apollo/client';
import { useRouter, NextRouter } from 'next/router';
import { useSession } from 'next-auth/client';
import { useEffect } from 'react';

import {
  AUTHENTICATE_EVERNOTE_MUTATION,
  CLEAR_EVERNOTE_AUTH_MUTATION,
} from '../graphql/mutations/evernote';
import { GET_USER_AUTHENTICATION_QUERY } from '../graphql/queries/user';
import { MAX_NOTES_LIMIT } from '../constants/evernote';

const onHandleOAuthParams = (router: NextRouter) => {
  // clear out the params sent back from the authentication
  router.replace('/import', '/import', { shallow: true });
};

function useEvernote() {
  const router: NextRouter = useRouter();
  const bundleSize = MAX_NOTES_LIMIT;
  const { query: { oauth_verifier } } = router;
  const [session] = useSession();
  const userId = session?.user?.userId;

  // idk why but grabbing these tokens off the session
  // doesn't immediately update on the client so we want to rely
  // on querying the user for auth status
  const { data, loading, refetch } = useQuery(GET_USER_AUTHENTICATION_QUERY, {
    variables: { id: userId },
  });

  const evernoteAuthToken = !loading && data?.user?.evernoteAuthToken;
  const evernoteExpiration = !loading && data?.user?.evernoteExpiration;
  const isExpired = !!(!loading && Date.now() > parseInt(evernoteExpiration));
  const isAuthenticated = !!(!loading && evernoteAuthToken && !isExpired);

  useEffect(handleEvernoteAuthVerifier, [oauth_verifier]);

  const [authenticateEvernote] = useMutation(AUTHENTICATE_EVERNOTE_MUTATION, {
    update: (_cache, { data: { authenticateEvernote } }) => {
      const { authURL = null } = authenticateEvernote || {};

      if (authURL) {
        window.open(authURL, '_self');
      }
    },
  });

  const [clearAuthentication] = useMutation(CLEAR_EVERNOTE_AUTH_MUTATION, {
    update: () => refetch({ id: session?.user?.userId }),
  });

  function handleEvernoteAuthVerifier() {
    if (oauth_verifier) {
      authenticateEvernote({
        update: () => onHandleOAuthParams(router),
        variables: { oauthVerifier: oauth_verifier },
      });
    } else if (!evernoteAuthToken) {
      refetch({ id: session?.user?.userId });
    }
  }

  return {
    meta: {
      bundleSize,
    },
    authenticateEvernote,
    clearAuthentication,
    isAuthenticated,
  };
}

export default useEvernote;
