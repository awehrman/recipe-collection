import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import Ingredient from './Ingredient';

const ALL_INGREDIENTS_QUERY = gql`
	query ALL_INGREDIENTS_QUERY {
		ingredients {
			id
			name
			plural
		}
	}
`;

const IngredientsStyles = styled.div`

`;

const IngredientList = styled.div`

`;

class IngredientsView extends Component {
	render() {
		return (
			<IngredientsStyles>
				<h2>Ingredients</h2>
				<Query query={ ALL_INGREDIENTS_QUERY }>
					{
						({ data, error, loading }) => {
							if (loading) return <p>Loading...</p>;
							if (error) return <p>Error: { error.message }</p>;

							return ( 
								<IngredientList>
									{
										data.ingredients.map(i => 
											<Ingredient ingredient={ i } key={ i.id } />
										)
									}
								</IngredientList>
							);
						}
					}
				</Query>
			</IngredientsStyles>
		)
	}
}

export default IngredientsView;