import React from 'react';
import styled from 'styled-components';

const Loading = () => (
	<Icon />
);

const Icon = styled.div`
	display: block;
	width: 36px;
	height: 36px;

	&:after {
		content: " ";
		display: block;
		width: 32px;
		height: 32px;
		margin: 2px;
		border-radius: 50%;
		border: 6px solid #ddd;
		border-color: #ddd transparent #ddd transparent;
		animation: lds-dual-ring 1.2s linear infinite;
	}

	@keyframes lds-dual-ring {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

`;

Loading.defaultProps = {}

Loading.displayName = 'Loading';

export default Loading;
