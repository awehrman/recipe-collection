import styled from 'styled-components';
import React from 'react';

import PropTypes from 'prop-types';

const LoadingStyles = styled.div`
	color: #444;
	padding: 20px 0;
`;

const Loading = ({ name }) => (
	<LoadingStyles>
		{ `Loading ${ name }...` }
	</LoadingStyles>
);

Loading.defaultProps = { name: '' };

Loading.propTypes = { name: PropTypes.string };

export default Loading;
