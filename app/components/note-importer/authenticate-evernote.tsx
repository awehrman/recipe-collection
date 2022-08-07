import React from 'react';
import styled from 'styled-components';

import useEvernote from '../../hooks/use-evernote';
import Button from '../common/button';

type AuthenticateEvernoteProps = {
};

const AuthenticateEvernote: React.FC<AuthenticateEvernoteProps> = () => {
  const { authenticateEvernote, isAuthenticated, clearAuthentication } = useEvernote();
  function handleAuthentication() {
    authenticateEvernote();
  }

  function handleClearAuthentication() {
    clearAuthentication();
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
          className='reset'
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
  background: #73c6b6;
  border-radius: 5px;
  padding: 6px 10px;
  font-size: 16px;
  font-weight: 600;
  margin: 0 10px 10px;

  &.reset {
    background: #ddd;
    color: #797979;
  }

  &:first-of-type {
    margin-left: 0;
  }
`;
