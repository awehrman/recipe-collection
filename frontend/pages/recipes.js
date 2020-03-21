import { useQuery } from '@apollo/client';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { GET_PAGINATED_RECIPES_QUERY, GET_RECIPES_COUNT_QUERY } from '../lib/apollo/queries/recipes';

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

const Recipes = ({ id = null }) => {
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
		// fetchMore,
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

				{/* show the current recipe or the grid */
					(id)
						? <Recipe id={ id } />
						: (
							<Grid
								count={ count || 0 }
								recipes={ recipes || [] }
							/>
						)
				}
				<AddNew />
			</section>
		</RecipesStyles>
	);
};

Recipes.defaultProps = { id: null };

Recipes.propTypes = { id: PropTypes.string };

export default Recipes;
