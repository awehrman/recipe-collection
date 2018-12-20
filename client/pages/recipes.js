import { Component } from 'react';
import styled from 'styled-components';

import Header from '../components/Header';
//import UpdateRecipe from '../components/UpdateRecipe';
//import RecipeGrid from '../components/RecipeGrid';

const RecipesStyles = styled.article`

`;

class Recipes extends Component {
	render() {
		return (
			<RecipesStyles>
				<Header pageHeader="Recipes" />
				<section>
					{/*
						(this.props.query.edit)
							? <UpdateRecipe id={ this.props.query.id } />
							: <RecipeGrid /> 
					*/}
				</section>
			</RecipesStyles>
		);		
	}
}


export default Recipes;