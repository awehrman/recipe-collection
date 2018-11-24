import { Component } from 'react';
import styled from 'styled-components';

import Header from '../components/Header';

const IngredientsStyles = styled.article`

`;

class Ingredients extends Component {
	render() {
		return (
			<IngredientsStyles>
				<Header pageHeader="Ingredients" />
				<section>
					
				</section>
			</IngredientsStyles>
		);		
	}
}


export default Ingredients;