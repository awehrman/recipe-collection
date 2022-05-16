
import { gql, useQuery, useMutation } from '@apollo/client';
import { useRouter, NextRouter } from 'next/router';
import { useSession } from 'next-auth/client';
import { useEffect } from 'react';

import { IMPORT_NOTES_MUTATION } from '../graphql/mutations/note';
import {
  AUTHENTICATE_EVERNOTE_MUTATION,
  CLEAR_EVERNOTE_AUTH_MUTATION,
} from '../graphql/mutations/evernote';
import { GET_USER_AUTHENTICATION_QUERY } from '../graphql/queries/user';

const onHandleOAuthParams = (router: NextRouter) => {
  // clear out the params sent back from the authentication
  router.replace('/import', '/import', { shallow: true });
};

// TODO pull from fragments
const fragment = gql`
  fragment NewNote on Note {
    id
    content
    evernoteGUID
    image
    isParsed
    source
    title
  }
`;

function useEvernote() {
  const router: NextRouter = useRouter();
  const bundleSize = 1;
  const {
    query: { oauth_verifier },
  } = router;
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

  const [importNotes, { loading: loadingNotes, data: notes }] = useMutation(IMPORT_NOTES_MUTATION, {
    update: (cache, { data }) => {
      const { importNotes: { notes } } = data;
      cache.modify({
        fields: {
          notes(existingNotes = []) {
            const newNotes = [];
            for (let i = 0; i < notes.length; i++) {
              const note = cache.writeFragment({
                data: notes[i],
                fragment
              });
              newNotes.push(note);
            }
            return [...existingNotes, ...newNotes];
          }
        }
      });
    }
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
    importNotes,
    isAuthenticated,
    loadingNotes,
    notes,
  };
}

export default useEvernote;
