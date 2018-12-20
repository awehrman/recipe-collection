import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import RecipeGridItem from './RecipeGridItem';

const ALL_RECIPES_QUERY = gql`
	query ALL_RECIPES_QUERY {
		recipes {
			id
			title
		}
	}
`;

const RecipeStyles = styled.div`

`;

const RecipeList = styled.div`

`;

class RecipeGrid extends Component {
	render() {
		return (
			<RecipeStyles>
				<h2>Recipes</h2>
				<Query query={ ALL_RECIPES_QUERY }>
					{
						({ data, error, loading }) => {
							if (loading) return <p>Loading...</p>;
							if (error) return <p>Error: { error.message }</p>;

							return ( 
								<RecipeList>
									{
										data.recipes.map(r => 
											<RecipeGridItem recipe={ r } key={ r.id } />
										)
									}
								</RecipeList>
							);
						}
					}
				</Query>
			</RecipeStyles>
		)
	}
}

export default RecipeGrid;
export { ALL_RECIPES_QUERY };