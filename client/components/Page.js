import NProgress from 'nprogress';
import PropTypes from 'prop-types';
import Router from 'next/router';
import styled, { ThemeProvider, injectGlobal } from 'styled-components';

import Meta from './Meta';
import Nav from './Nav';

// TODO naming convention cleanup
const theme = {
	lighterGrey: 'rgba(144, 148, 151, 1)',
	red: 'rgba(255, 99, 72, 1)',
	green: 'rgba(120, 224, 143, 1)',
	orange: 'rgba(255, 159, 67, 1)',
	highlight: 'rgba(128, 174, 245, 1)',

	menuBackground: 'rgba(43, 61, 90, 1)',
	menuColor: '#c7d7f9',
	menuWidth: '200px',
	menuOffset: '160px',
	minMenuWidth: '40px',

	headerBackground: 'rgba(248, 248, 248, 1)',
	headerColor: 'rgba(144, 148, 151, 1)',

	bodyText: 'rgba(34, 34, 34, 1)',

	tablet: '768px',
	desktop_small: '1024px',
	desktop_large: '1300px',

	mobileCardHeight: '500px',
	desktopCardHeight: '500px',

	mobileListHeight: '200px',
	desktopListHeight: '200px',

	desktopCardWidth: '880px',

	altGreen: '#73C6B6',
	greenBackground: '#E8F8F5',

	fontFamily: '"Source Sans Pro", Verdana, sans-serif',
};

// TODO look into upgrading styled-components & nextjs
// this will change in v4 when that happens
// eslint-disable-next-line no-unused-expressions
injectGlobal`
	@import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600,700');

	html {
	  box-sizing: border-box;
	  height: 100%;
	}

	*, *:before, *:after {
		box-sizing: inherit;
	}

	*:focus {
		/* for whatever reason its not picking up a passed props.theme value here */
		outline: 2px dotted rgba(128, 174, 245, 1);
	}

	body {
		-webkit-font-smoothing: antialiased;
	  margin: 0;
		padding: 0;
		font-family: "Source Sans Pro", Verdana, sans-serif;
		font-weight: 400;
		font-size: 100%;
		color: ${ props => props.theme.bodyText };
		height: 100%;
	}

	h2 {
		font-size: 1em;
		font-weight: 600;
	}
`;

const Canvas = styled.div`
	position: absolute;
	overflow-x: hidden;
	width: 100%;
	height: 100%;
`;

const Wrapper = styled.div`
	position: relative;
	top: ${ props => props.theme.minMenuWidth };
	left: 0;
	transition: .2s ease-out;
	width: 100%;
	height: 100%;

	section {
		padding: 20px 40px;
		background: white;
	}

	@media (min-width: ${ props => props.theme.tablet }) {
		top: 0;
		left: ${ props => (props.theme.expaned ? props.theme.menuOffset : props.theme.minMenuWidth) };
	
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
