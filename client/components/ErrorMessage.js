import styled from 'styled-components';
import React from 'react';

import PropTypes from 'prop-types';

const ErrorStyles = styled.div`
  // TODO
	color: tomato;

	strong {
		padding-right: 5px;
	}
`;

const DisplayError = ({ error }) => {
  if (!error || !error.message) return null;

  if (error.networkError && error.networkError.result && error.networkError.result.errors.length) {
    return error.networkError.result.errors.map((error, i) => (
      <ErrorStyles key={i}>
        <p data-test="graphql-error">
          <strong>An error occurred!</strong>
          { error.message.replace('GraphQL error: ', '') }
        </p>
      </ErrorStyles>
    ));
  }

  return (
    <ErrorStyles>
      <p data-test="graphql-error">
        <strong>An error occurred!</strong>
        { error.message.replace('GraphQL error: ', '') }
      </p>
    </ErrorStyles>
  );
};

DisplayError.defaultProps = {
  error: {},
};

DisplayError.propTypes = {
  error: PropTypes.object,
};

export default DisplayError;
