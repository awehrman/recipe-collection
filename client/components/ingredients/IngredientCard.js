import { Component } from 'react';
import Link from 'next/link';
import styled from 'styled-components';

const CardStyles = styled.div`
	max-height: ${ props => props.theme.mobileCardHeight };
	padding: 20px;
	border-bottom: 1px solid #ddd;
	//border: 2px solid tomato;
	width: 100%;

	@media (min-width: 880px) {
		flex-basis: 70%;
		flex-grow: 2;
		order: 1;
		height: ${ props => props.theme.desktopCardHeight };
		border-left: 1px solid #ddd;
	}
`;

class IngredientCard extends Component {
	render() {
		const { currentIngredientID  } = this.props;
	
		return (
			<CardStyles>
				Card { currentIngredientID  }
			</CardStyles>
		);		
	}
}


export default IngredientCard;