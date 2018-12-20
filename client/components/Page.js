import { Component } from 'react';
import styled, { ThemeProvider, injectGlobal } from 'styled-components';
import Router from 'next/router';
import NProgress from 'nprogress';

import Meta from '../components/Meta';
import Nav from '../components/Nav';

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

	altGreen: '#73C6B6',
	greenBackground: '#E8F8F5',

	fontFamily: '"Source Sans Pro", Verdana, sans-serif'
};

injectGlobal`
	@import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600,700');

	html {
	  box-sizing: border-box;
	  height: 100%;
	}

	*, *:before, *:after {
		box-sizing: inherit;
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
		left: ${ props => props.theme.expaned ? props.theme.menuOffset: props.theme.minMenuWidth };
	
		section {
			margin-right: 40px;
		}

	}
`;

Router.onRouteChangeStart = () => {
	NProgress.start();
}

Router.onRouteChangeComplete = () => {
	NProgress.done();
}

Router.onRouteChangeError = () => {
	NProgress.done();
}


class Page extends Component {
	constructor(props) {
		super(props);

		this.state = {
			isNavExpanded: false
		};
	}

	toggleNav(e) {
		const { isNavExpanded } = this.state;

		this.setState({
			isNavExpanded: !isNavExpanded
		});
	}

	render() {
		const { isNavExpanded } = this.state;

		return (
			<ThemeProvider theme={ theme }>
				<Canvas>
					<Meta />
					<Wrapper>
						<Nav
							isExpanded={ isNavExpanded }
							onLinkClick={ e => this.toggleNav(e) }
							onMenuIconClick={ e => this.toggleNav(e) }
						/>
						{ this.props.children }
					</Wrapper>
				</Canvas>
			</ThemeProvider>
		);		
	}
}


export default Page;