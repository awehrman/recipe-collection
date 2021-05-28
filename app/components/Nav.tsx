import React, { useContext, useEffect, useRef } from 'react';
import styled, { ThemeContext } from 'styled-components';
import { lighten } from 'polished';

import Button from './common/Button';
import NavigationIconSVG from './../public/icons/ellipsis-v-regular.svg';

type NavProps = {
	isExpanded: boolean;
	setIsExpanded: (_value: boolean) => void;
}

const Navigation: React.FC<NavProps> = ({ isExpanded, setIsExpanded }) => {
	const themeContext = useContext(ThemeContext);
	const { sizes: { tablet } } = themeContext;
	const tabletSize = parseInt(tablet, 10);

	const navRef = useRef<HTMLDivElement>(null);
	const navIconRef = useRef<HTMLButtonElement|null>(null);

	useEffect(() => {
		if (navRef?.current) {
			navRef.current.addEventListener('mouseover', handleMouseOver);
			navRef.current.addEventListener('mouseleave', handleMouseLeave);
		}

    return () => {
			if (navRef?.current) {
				navRef.current.removeEventListener('mouseover', handleMouseOver);
				navRef.current.removeEventListener('mouseleave', handleMouseLeave);
			}
    };
  }, [handleMouseOver, handleMouseLeave]);

	function onNavIconClick(e: React.MouseEvent) {
		e.preventDefault();
		setIsExpanded(!isExpanded);
	}

	// note: need to use native mouse event for the event handlers
	function handleMouseOver(e: MouseEvent) {
		// enable event listeners if we're in at least tablet size
		if (window.innerWidth > tabletSize) {
			const yPosition = ((e.clientY - 20) < 0) ? 20 : e.clientY - 10;

			// move the menu icon to where ever our cursor is
			if (navIconRef?.current) {
				console.log(`adjusting to ${yPosition}px`);
				navIconRef.current.style.top = `${yPosition}px`;
				console.log(navIconRef.current.style.top);
			}

			// keep updating this anytime we move our mouse around the nav
			if (navRef?.current) {
				navRef.current.addEventListener('mousemove', handleMouseOver);
			}
		}
	}

	function handleMouseLeave() {
		// cleanup this event if we're not in the nav
		if (navRef?.current) {
			navRef.current.removeEventListener('mousemove', handleMouseOver);
		}

		// if we're in mobile, make sure we put our menu icon back at the top
		if (navIconRef?.current && window.innerWidth > tabletSize) {
			navIconRef.current.style.top = '20px';
		}
	}

	return (
		<NavStyles ref={navRef} isExpanded={isExpanded} theme={themeContext} >
			<Button
				ref={navIconRef}
				className='navigationIcon'
				icon={<NavigationIconSVG />}
				onClick={onNavIconClick}
			/>
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

	button.navigationIcon {
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
					color: ${ ({ theme }) => lighten(0.1, theme.colors.menuColor) };
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