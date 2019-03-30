import NProgress from 'nprogress';
import PropTypes from 'prop-types';
import Router from 'next/router';
import styled, { ThemeProvider } from 'styled-components';

import Meta from './Meta';
import Nav from './Nav';
import theme from '../styles/theme.style';

const Canvas = styled.div`
	position: absolute;
	overflow-x: hidden;
	width: 100%;
	height: 100%;
`;

const Wrapper = styled.div`
	position: relative;
	top: ${ theme.minMenuWidth };
	left: 0;
	transition: .2s ease-out;
	width: 100%;
	height: 100%;

	section {
		padding: 20px 40px;
		background: white;
	}

	@media (min-width: ${ theme.tablet }) {
		top: 0;
		left: ${ (theme.expaned ? theme.menuOffset : theme.minMenuWidth) };

		section {
			margin-right: 40px;
		}

	}
`;

// setup NProgress bar events
Router.onRouteChangeStart = () => {
	NProgress.start();
};

Router.onRouteChangeComplete = () => {
	NProgress.done();
};

Router.onRouteChangeError = () => {
	NProgress.done();
};

const Page = ({ children }) => (
	<ThemeProvider theme={ theme }>
		<Canvas>
			<Meta />
			<Wrapper>
				<Nav />
				{ children }
			</Wrapper>
		</Canvas>
	</ThemeProvider>
);

Page.propTypes = { children: PropTypes.node.isRequired };

export default Page;
export { theme };
