import { Component } from 'react';
import styled from 'styled-components';

import Header from '../components/Header';

const RecipesStyles = styled.article`

`;

class Recipes extends Component {
	render() {
		return (
			<RecipesStyles>
				<Header pageHeader="Recipes" />
				<section>
					
				</section>
			</RecipesStyles>
		);		
	}
}


export default Recipes;