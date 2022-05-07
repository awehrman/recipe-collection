import React from 'react';
import styled from 'styled-components';

const Loading = () => (
	<Icon>...</Icon>
);

const Icon = styled.div`
	color: #333;
	font-weight: bold;
	font-size: 14px;
`;

Loading.defaultProps = {}

Loading.displayName = 'Loading';

export default Loading;
