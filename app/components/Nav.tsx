import React, { useContext, useRef } from 'react';
import styled, { ThemeContext } from 'styled-components';

type NavProps = {
	isExpanded: boolean;
	setIsExpanded: (val: boolean) => void;
}

const Navigation: React.FC<NavProps> = ({ isExpanded, setIsExpanded }) => {
	const themeContext = useContext(ThemeContext);
	const navRef = useRef(null);
	return (
		<NavStyles ref={navRef} isExpanded={isExpanded} theme={themeContext} >
			...
		</NavStyles>
	);
}

export default Navigation;

type NavStylesProps = {
	isExpanded: boolean;
}

const NavStyles = styled.nav<NavStylesProps>`
	/* mobile top nav */
	background: ${ ({ theme }) => theme.colors.menuBackground };
	position: fixed;
	top: 0;
	width: 100%;
	z-index: 1000; /* we want this higher than the nprogress bar*/

	.navigationIcon {
		color: ${ ({ theme }) => theme.colors.menuColor };
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
			/* color: ${ ({ theme }) => lighten(0.1, theme.colors.menuColor) }; */
		}
	}

	ul {
		display: ${ ({ isExpanded }) => isExpanded ? 'block' : 'none' };
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
				color: ${ ({ theme }) => theme.colors.menuColor };
				font-size: .875em;
				font-weight: 400;

				&:hover {
					/* color: ${ ({ theme }) => lighten(0.1, theme.colors.menuColor) }; */
				}

				svg {
					margin-right: 10px;
					height: 14px;
				}
			}
		}
	}

	/* tablet and larger moves the nav to the left */
	@media (min-width: ${ ({ theme }) => theme.sizes.tablet }) {
		width: ${ ({ theme }) => theme.sizes.menuWidth };
		left: -${ ({ isExpanded, theme }) => (isExpanded ? 0 : theme.sizes.menuOffset) };
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
				color: ${ ({ theme }) => theme.colors.highlight };
			}
		}
	}
`;