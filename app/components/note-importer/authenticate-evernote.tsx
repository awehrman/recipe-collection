import { useMutation } from '@apollo/client';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import styled from 'styled-components';

import {
  AUTHENTICATE_EVERNOTE_MUTATION,
  CLEAR_EVERNOTE_AUTH_MUTATION,
} from '../../graphql/mutations/evernote';
import Button from '../common/Button';

type AuthenticateEvernoteProps = {

};

const AuthenticateEvernote: React.FC<AuthenticateEvernoteProps> = () => {
  const [session] = useSession();
  const { evernoteAuthToken, expires } = session || {};
  const isAuthenticated = evernoteAuthToken && new Date(expires) > new Date();
  const router = useRouter();
  const {
    query: { oauth_verifier },
  } = router;

  const [authenticateEvernote] = useMutation(AUTHENTICATE_EVERNOTE_MUTATION, {
    update: (cache, { data: { authenticateEvernote } }) => {
      const { authURL = null } = authenticateEvernote || {};

      if (authURL) {
        window.open(authURL, '_self');
      }
    },
  });

  const [clearAuthentication] = useMutation(CLEAR_EVERNOTE_AUTH_MUTATION, {
    update: () => {
      console.log('finished clearing session data');
    },
  });

  function handleEvernoteAuthVerifier() {
    if (oauth_verifier) {
      authenticateEvernote({
        update: () => {
          // update url
          router.replace('/import', '/import', { shallow: true });
        },
        variables: { oauthVerifier: oauth_verifier },
      });
    }
  }

  function handleClearAuthentication() {
    clearAuthentication();
  }

  useEffect(handleEvernoteAuthVerifier, [oauth_verifier]);

  function handleAuthentication() {
    authenticateEvernote();
  }

  return (
    <React.Fragment>
      {!isAuthenticated ? (
        <StyledButton
          label='Authenticate Evernote'
          onClick={handleAuthentication}
          type='button'
        />
      ) : (
        <StyledButton
          label='Clear Authentication'
          onClick={handleClearAuthentication}
          type='button'
        />
      )}
    </React.Fragment>
  );
};

export default AuthenticateEvernote;

const StyledButton = styled(Button)`
  cursor: pointer;
  border: 0;
  color: white;
  background: '#73C6B6';
  border-radius: 5px;
  padding: 6px 10px;
  font-size: 16px;
  font-weight: 600;
  margin: 0 10px 10px;

  &:first-of-type {
    margin-left: 0;
  }
`;
