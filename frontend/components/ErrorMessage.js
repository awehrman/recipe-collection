import styled from 'styled-components';
import React from 'react';

import PropTypes from 'prop-types';

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
			// eslint-disable-next-line react/no-array-index-key
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

ErrorMessage.propTypes = {
	error: PropTypes.shape({
		message: PropTypes.string,
		networkError: PropTypes.shape({ result: PropTypes.shape({ errors: PropTypes.arrayOf() }) }),
	}),
};

export default ErrorMessage;
