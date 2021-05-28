import { lighten } from 'polished';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudDownload, faEllipsisV, faHome, faLemon, faFolderOpen } from '@fortawesome/pro-regular-svg-icons';
import PropTypes from 'prop-types';
import React from 'react';
import styled, { withTheme } from 'styled-components';

import ButtonLink from './common/ButtonLink';

// TODO convert to functional component
class Nav extends React.PureComponent {
	constructor(props) {
		super(props);

		this.state = { isExpanded: false };

		this.navigation = React.createRef();
		this.navigationIcon = React.createRef();
	}

	componentDidMount() {
		this.navigation.current.addEventListener('mouseover', this.onMouseOver);
		this.navigation.current.addEventListener('mouseleave', this.onMouseLeave);
	}

	componentWillUnmount() {
		this.navigation.current.removeEventListener('mouseover', this.onMouseOver);
		this.navigation.current.removeEventListener('mouseleave', this.onMouseLeave);
	}

	onToggleNav = () => {
		const { isExpanded } = this.state;
		this.setState({ isExpanded: !isExpanded });
	}

	onMouseOver = (e) => {
		const { theme } = this.props;
		let { tablet } = theme;

		// tease out the integer and drop whatever units we're using (px, rem, etc.)
		tablet = parseInt(tablet, 10);

		// enable event listeners if we're in at least tablet size
		if (window.innerWidth > tablet) {
			const yPosition = ((e.clientY - 20) < 0) ? 20 : e.clientY - 10;

			// move the menu icon to where ever our cursor is
			this.navigationIcon.current.style = `top: ${ yPosition }px;`;

			// keep updating this anytime we move our mouse around the nav
			this.navigation.current.addEventListener('mousemove', this.onMouseOver);
		}
	}

	onMouseLeave = () => {
		const { theme } = this.props;
		let { tablet } = theme;

		// drop whatever units we're using (px, rem, etc.)
		tablet = parseInt(tablet, 10);

		// cleanup this event if we're not in the nav
		this.navigation.current.removeEventListener('mousemove', this.onMouseOver);

		// if we're in mobile, make sure we put our menu icon back at the top
		if (window.innerWidth > tablet) {
			this.navigationIcon.current.style = 'top: 20px';
		}
	}

	render() {
		const { isExpanded } = this.state;

		return (
			<NavStyles expanded={ isExpanded } ref={ this.navigation }>
				<button
					className="navigationIcon"
					onClick={ this.onToggleNav }
					ref={ this.navigationIcon }
					type="button"
				>
					<FontAwesomeIcon icon={ faEllipsisV } />
				</button>
				<ul>
					{/* Home */}
					<li>
						<ButtonLink
							className="link"
							href="/"
							icon={ <FontAwesomeIcon icon={ faHome } /> }
							label="Home"
							onClick={ this.onToggleNav }
						/>
					</li>

					{/* Import */}
					<li>
						<ButtonLink
							className="link"
							href="/import"
							icon={ <FontAwesomeIcon icon={ faCloudDownload } /> }
							label="Import"
							onClick={ this.onToggleNav }
						/>
					</li>

					{/* Ingredients */}
					<li>
						<ButtonLink
							className="link"
							href="/ingredients"
							icon={ <FontAwesomeIcon icon={ faLemon } /> }
							label="Ingredients"
							onClick={ this.onToggleNav }
						/>
					</li>

					{/* Recipes */}
					<li>
						<ButtonLink
							className="link"
							href="/recipes"
							icon={ <FontAwesomeIcon icon={ faFolderOpen } /> }
							label="Recipes"
							onClick={ this.onToggleNav }
						/>
					</li>
				</ul>
			</NavStyles>
		);
	}
}

Nav.propTypes = { theme: PropTypes.shape({ tablet: PropTypes.string }).isRequired };

// withTheme() gives us access to the styled-components global theme variable
export default withTheme(Nav);

const NavStyles = styled.nav`
	/* mobile top nav */
	background: ${ (props) => props.theme.menuBackground };
	position: fixed;
	top: 0;
	width: 100%;
	z-index: 1000; /* we want this higher than the nprogress bar*/

	.navigationIcon {
		color: ${ (props) => props.theme.menuColor };
		cursor: pointer;
		display: block;
		padding: 10px;
		text-align: left;
		margin-right: 10px;
		float: right;
		border: 0;
		background: transparent;
		font-size: 1em;

		svg {
			/* TODO look into SVG FOUT issues */
			height: 16px !important;
		}

		&:hover {
			color: ${ (props) => lighten(0.1, props.theme.menuColor) };
		}
	}

	ul {
		display: ${ (props) => (props.expanded ? 'block' : 'none') };
		list-style-type: none;
		padding: 0;
		margin: 20px;

		li {
			margin: 20px 0;

			&:first-of-type {
				margin-top: 0;
			}

			button {
				border: 0;
				background: transparent;
				cursor: pointer;
				text-decoration: none;
				color: ${ (props) => props.theme.menuColor };
				font-size: .875em;
				font-weight: 400;

				&:hover {
					color: ${ (props) => lighten(0.1, props.theme.menuColor) };
				}

				svg {
					margin-right: 10px;
					height: 14px;
				}
			}
		}
	}

	/* tablet and larger moves the nav to the left */
	@media (min-width: ${ (props) => props.theme.tablet }) {
		width: ${ (props) => props.theme.menuWidth };
		left: -${ (props) => (props.expanded ? 0 : props.theme.menuOffset) };
		bottom: 0;
		transition: .2s ease-out;

		button.navigationIcon {
			position: relative;
			width: 40px;
			text-align: center;
			margin: 0 auto;
			margin-right: 0;

			&:focus {
				outline-width: 0;
				color: ${ (props) => props.theme.highlight };
			}
		}
	}
`;
