import { useQuery, useMutation } from '@apollo/client';
import { useSession } from 'next-auth/client';
import { useRouter, NextRouter } from 'next/router';
import React, { useEffect } from 'react';
import styled from 'styled-components';

import {
  AUTHENTICATE_EVERNOTE_MUTATION,
  CLEAR_EVERNOTE_AUTH_MUTATION,
} from '../../graphql/mutations/evernote';
import { GET_USER_AUTHENTICATION_QUERY } from '../../graphql/queries/user';
import Button from '../common/Button';

type AuthenticateEvernoteProps = {
}

const onAuthenticateEvernoteUpdate = ({ data: { authenticateEvernote } }) => {
  const { authURL = null } = authenticateEvernote || {};

  if (authURL) {
    window.open(authURL, '_self');
  }
};

const onHandleOAuthParams = (router: NextRouter) => {
  // clear out the params sent back from the authentication
  router.replace('/import', '/import', { shallow: true });
};

const AuthenticateEvernote: React.FC<AuthenticateEvernoteProps> = () => {
  const router: NextRouter = useRouter();
  const [session] = useSession();
  // TODO move into the useEvernote hook
  const { data, loading, refetch } = useQuery(
    GET_USER_AUTHENTICATION_QUERY,
    { variables: { id: session?.user?.userId } }
  );
  const evernoteAuthToken = !loading && data?.user?.evernoteAuthToken;
  const evernoteExpiration = !loading && data?.user?.evernoteExpiration;
  const isExpired = !loading &&  Date.now() > parseInt(evernoteExpiration);
  const isAuthenticated = !loading && evernoteAuthToken && !isExpired;
  const { query: { oauth_verifier } } = router;

  useEffect(handleEvernoteAuthVerifier, [oauth_verifier]);

  const [authenticateEvernote] = useMutation(AUTHENTICATE_EVERNOTE_MUTATION, {
    update: (cache, data) => onAuthenticateEvernoteUpdate(data),
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

  function handleClearAuthentication() {
    clearAuthentication();
  }

  function handleAuthentication() {
    authenticateEvernote();
  }

  return (
    <React.Fragment>
      <StyledButton
        label='Authenticate Evernote'
        onClick={handleAuthentication}
        type='button'
      />
      <StyledButton
        className='reset'
        label='Clear Authentication'
        onClick={handleClearAuthentication}
        type='button'
      />
    </React.Fragment>
  );
};

export default AuthenticateEvernote;

const StyledButton = styled(Button)`
  cursor: pointer;
  border: 0;
  color: white;
  background: #73C6B6;
  border-radius: 5px;
  padding: 6px 10px;
  font-size: 16px;
  font-weight: 600;
  margin: 0 10px 10px;

  &:first-of-type {
    margin-left: 0;
  }
`;
