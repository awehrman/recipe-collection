import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const Loading = ({ className, name }) => (
	<LoadingStyles className={ className }>
		{ `Loading ${ name }...` }
	</LoadingStyles>
);

Loading.defaultProps = {
	className: '',
	name: '',
};

Loading.propTypes = {
	className: PropTypes.string,
	name: PropTypes.string,
};

export default Loading;

const LoadingStyles = styled.div`
	color: #444;
	padding: 20px 0;

	&.card {
		background: '#b8b8b8';
		color: #ccc;
		font-weight: 600;
		font-size: 24px;
		width: 23%;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 190px;
	}
`;
