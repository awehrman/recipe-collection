import React from 'react';
import styled from 'styled-components';

import Nav from './Nav';

const Page: React.FC = ({ children }) => (
  <Canvas>
    <Nav />
    { children }
  </Canvas>
)

export default Page;

const Canvas = styled.div`
	position: absolute;
	overflow-x: hidden;
	width: 100%;
	height: 100%;
`;

// const Wrapper = styled.div`
// 	position: relative;
// 	top: ${ theme.minMenuWidth };
// 	left: 0;
// 	transition: .2s ease-out;
// 	width: 100%;
// 	height: 100%;

// 	section {
// 		padding: 20px 40px;
// 		background: white;
// 	}

// 	@media (min-width: ${ theme.tablet }) {
// 		top: 0;
// 		left: ${ (theme.expanded ? theme.menuOffset : theme.minMenuWidth) };

// 		section {
// 			margin-right: 40px;
// 		}
// 	}
// `;
