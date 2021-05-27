import React, { useContext } from 'react';
import styled, { ThemeContext } from 'styled-components';

const Navigation: React.FC = () => {
	const themeContext = useContext(ThemeContext);
	console.log('Current theme: ', themeContext);
	return (
		<NavStyles>
			Navigation...
		</NavStyles>
	);
}

export default Navigation;

const NavStyles = styled.nav``;