import { useQuery } from '@apollo/client';
import React, { useState } from 'react';
import styled from 'styled-components';
import { GET_CURRENT_RECIPE_QUERY, GET_PAGINATED_RECIPES_QUERY, GET_RECIPES_COUNT_QUERY } from '../lib/apollo/queries';

import AddNew from '../components/recipes/AddNew';
import ErrorMessage from '../components/ErrorMessage';
import Header from '../components/Header';
import Grid from '../components/recipes/Grid';
import Loading from '../components/Loading';
import Recipe from '../components/recipes/Recipe';

const Count = styled.div`
	display: flex;
	font-size: .875em;
	color: #222;
	margin-bottom: 20px;

	&.left {
		flex: 1;
	}

	&.right {
		flex: 1;
		text-align: right;
		font-weight: 600;
		justify-content: flex-end;
	}
`;

const RecipesStyles = styled.article`
`;

const Recipes = () => {
	const [ currentRecipeID, setCurrentRecipeID ] = useState(null);

	// fetch the recipe totals
	const {
		data: countData = {},
		loading: countLoading,
		error: countError,
	} = useQuery(GET_RECIPES_COUNT_QUERY);
	const { recipeAggregate = {} } = countData;
	const { count = 0 } = recipeAggregate;

	// fetch the initial batch of recipes
	const {
		data = {},
		fetchMore,
		loading,
		error,
	} = useQuery(GET_PAGINATED_RECIPES_QUERY);
	const { recipes = [] } = data;

	return (
		<RecipesStyles>
			<Header pageHeader="Recipes" />
			<section>
				<Count className="right">
					{ count || 0 }
				</Count>

				{/* Error Messages */
					(error || countError)
						? <ErrorMessage error={ error || countError } />
						: null
				}

				{/* Loading */
					(loading || countLoading)
						? <Loading name="recipes" />
						: null
				}

				<Grid
					count={ count || 0 }
					fetchMore={ fetchMore }
					recipes={ recipes || [] }
					// onRecipeClick={ this.onRecipeClick }
				/>

				{/* TODO
					(currentRecipeID && recipe)
						? (
							<Recipe
								// onCloseClick={ this.onCloseClick }
								recipe={ recipe }
							/>
						)
						: null
				*/}
				<AddNew />
			</section>
		</RecipesStyles>
	);
};

export default Recipes;
