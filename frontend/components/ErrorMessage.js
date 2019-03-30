import styled from 'styled-components';
import React from 'react';

import PropTypes from 'prop-types';

// TODO
const ErrorStyles = styled.div`
	color: tomato;

	strong {
		padding-right: 5px;
	}
`;

const ErrorMessage = ({ error }) => {
	if (!error || !error.message) return null;

	if (error.networkError && error.networkError.result && error.networkError.result.errors.length) {
		return error.networkError.result.errors.map((err, i) => (
			// eslint-disable-next-line no-array-index-key
			<ErrorStyles key={ `error_${ i }` }>
				<p data-test="graphql-error">
					<strong>Error:</strong>
					{ err.message.replace('GraphQL error: ', '') }
				</p>
			</ErrorStyles>
		));
	}

	return (
		<ErrorStyles>
			<p data-test="graphql-error">
				<strong>Error:</strong>
				{ error.message.replace('GraphQL error: ', '') }
			</p>
		</ErrorStyles>
	);
};

ErrorMessage.defaultProps = { error: {} };

// TODO improve proptype
ErrorMessage.propTypes = { error: PropTypes.object };

export default ErrorMessage;
