import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import Button from '../components/common/Button';
import { AUTHENTICATE_EVERNOTE_MUTATION } from '../graphql/mutations/evernote';

type PopupProps = {
}

const Popup: React.FC<PopupProps> = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
	const { query: { oauth_verifier } } = router;
  // TODO move this update callback into a shared file
  const [authenticateEvernote] = useMutation(AUTHENTICATE_EVERNOTE_MUTATION, {
    update: (cache, { data: { authenticateEvernote } }) => {
      const { authURL = null } = authenticateEvernote || {};

      if (authenticateEvernote?.isAuthenticated) {
        setIsAuthenticated(true);
      }

      if (authURL) {
        window.open(authURL, '_self');
      }
    },
  });

  function handleEvernoteAuthVerifier() {
    if (oauth_verifier) {
			authenticateEvernote({
				update: () => {
					// update url
					router.replace('/popup', '/popup', { shallow: true });
				},
				variables: { oauthVerifier: oauth_verifier },
			});
		}
  }

  useEffect(handleEvernoteAuthVerifier, [oauth_verifier]);

  function handleAuthentication() {
    authenticateEvernote();
  }

  return (
    <Wrapper>
      {!isAuthenticated ? (
      <Button
        label='Authenticate Evernote'
        onClick={handleAuthentication}
        type='button'
        />
      ) : <span>is authenticated</span>
    }
    </Wrapper>
  )
}

export default Popup;

const Wrapper = styled.div`
  width: 600px;
  height: 800px;
`;
