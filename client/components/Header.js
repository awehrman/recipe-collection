import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const HeaderStyles = styled.div`
	background: ${ props => props.theme.headerBackground };
	margin: 0;
	display: flex;
	align-items: center;
	padding: 40px;
	height: 100px;

	h1 {
		margin: 0;
		font-weight: 300;
		font-size: 2em;
		color: ${ props => props.theme.headerColor };
	}
`;

class Header extends React.PureComponent {
	render() {
		const { pageHeader } = this.props;

		return (
			<HeaderStyles>
				{/* TODO incorporate <Search /> */}
				<h1>{ pageHeader }</h1>
			</HeaderStyles>
		);
	}
}

Header.propTypes = { pageHeader: PropTypes.string.isRequired };

export default Header;
