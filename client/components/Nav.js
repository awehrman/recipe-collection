import { Component } from 'react';
import Link from 'next/link';
import styled, { withTheme } from 'styled-components';
import { lighten } from 'polished';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';

// TODO there's a pretty bad case of FOUT in next
import faEllipsisV from '@fortawesome/fontawesome-pro-regular/faEllipsisV';
import faHome from '@fortawesome/fontawesome-pro-regular/faHome';
import faCloudDownload from '@fortawesome/fontawesome-pro-regular/faCloudDownload';
import faLemon from '@fortawesome/fontawesome-pro-regular/faLemon';
import faFolderOpen from '@fortawesome/fontawesome-pro-regular/faFolderOpen';

const NavStyles = styled.nav`
	background: ${ props => props.theme.menuBackground };
	position: fixed;
	top: 0;
	width: 100%;
	z-index: 500; /* we want this higher than the nprogess bar*/

	.menu-icon {
		color: ${ props => props.theme.menuColor };
		cursor: pointer;
		display: block;
		padding: 10px;
		text-align: left;
		margin-left: 10px;

		svg {
			/* this helps the FOUT issue but there's still a bit of movement on reload */
			height: 16px;
		}
		
		&:hover {
			color: ${ props => lighten(0.1, props.theme.menuColor) };
		}
	}


	ul {
		display: ${ props => props.expanded ? 'block' : 'none' };
		list-style-type: none;
		padding: 0;
		margin: 0 20px;

		li {
			margin: 20px 0;

			&:first-of-type {
				margin-top: 0;
			}

			a {
				text-decoration: none;
				color: ${ props => props.theme.menuColor };
				font-size: .875em;
				font-weight: 400;

				&:hover {
					color: ${ props => lighten(0.1, props.theme.menuColor) };
				}

				svg {
					margin-right: 10px;
				}
			}
		}
	}

	@media (min-width: ${ props => props.theme.tablet }) {
		width: ${ props => props.theme.menuWidth };
		left: -${ props => (props.expanded ? 0 : props.theme.menuOffset) };
		bottom: 0;
		transition: .2s ease-out;

		.menu-icon {
			position: relative;
			left: 80px;
			width: 40px;
			text-align: center;
			margin: 0 auto;	
		}
	}
`;

class Nav extends Component {
	componentDidMount() {
		this.navigation.addEventListener('mouseover', this.onMouseOver);
		this.navigation.addEventListener('mouseleave', this.onMouseLeave);
	}

	componentWillUnmount() {
		this.navigation.removeEventListener('mouseover', this.onMouseOver);
		this.navigation.removeEventListener('mouseleave', this.onMouseLeave);
	}

	onMouseOver = (e) => {
		// withTheme() gives us access to the theme props here
		let { tablet } = this.props.theme;
		// drop whatever units we're using (px, rem, etc.)
		tablet = parseInt(tablet, 10);

		if (window.innerWidth > tablet) {
			const yPosition = ((e.clientY - 20) < 0) ? 20 : e.clientY - 10;
			// move the menu icon to whereever our cursor is
			this.menuIcon.style = `top: ${ yPosition }px;`;

			// keep updating this anytime we move our mouse around the nav
			this.navigation.addEventListener('mousemove', this.onMouseOver);
		}
	}

	onMouseLeave = () => {
		// withTheme() gives us access to the theme props here
		let { tablet } = this.props.theme;
		// drop whatever units we're using (px, rem, etc.)
		tablet = parseInt(tablet, 10);

		// cleanup this event if we're not in the nav
		this.navigation.removeEventListener('mousemove', this.onMouseOver);

		// if we're in mobile, make sure we put our menu icon back at the top
		if (window.innerWidth > tablet) {
			this.menuIcon.style = 'top: 20px';
		}
	}

	render() {
		const { isExpanded } = this.props;

		return (
			<NavStyles expanded={ isExpanded } innerRef={ el => this.navigation = el }>
				<span className="menu-icon" onClick={ this.props.onMenuIconClick } ref={ el => this.menuIcon = el } >
					<FontAwesomeIcon icon={ faEllipsisV } />
				</span>

				{
					/*
						i guess nextjs doesn't support custom onClick events on the Link component?
						that's why i'm wrapping these elements in a span so that we can close up the nav on click
					*/
				}
				<ul>
					<li>
						<span onClick={ this.props.onLinkClick }>
				    	<Link href="/">
				    		<a><FontAwesomeIcon icon={ faHome } />Home</a>
				    	</Link>
			    	</span>
			    </li>
			    <li>
			    	<span onClick={ this.props.onLinkClick }>
				    	<Link href="/import">
				    		<a><FontAwesomeIcon icon={ faCloudDownload } />Import</a>
				    	</Link>
			    	</span>
			    </li>
			    <li>
			    	<span onClick={ this.props.onLinkClick }>
				    	<Link href="/ingredients">
				    		<a><FontAwesomeIcon icon={ faLemon } />Ingredients</a>
				    	</Link>
				    </span>
			    </li>
			    <li>
			    	<span onClick={ this.props.onLinkClick }>
				    	<Link href="/recipes">
				    		<a><FontAwesomeIcon icon={ faFolderOpen } />Recipes</a>
				    	</Link>
				    </span>
			    </li>
				</ul>
			</NavStyles>
		);		
	}
}

export default withTheme(Nav);
