import { adopt } from 'react-adopt';
import React from 'react';
import { Query, withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { GET_CURRENT_RECIPE_QUERY, GET_PAGINATED_RECIPES_QUERY, GET_RECIPES_COUNT_QUERY } from '../lib/apollo/queries';

import AddNew from '../components/recipes/AddNew';
import ErrorMessage from '../components/ErrorMessage';
import Header from '../components/Header';
import Grid from '../components/recipes/Grid';
import Loading from '../components/Loading';
import Recipe from '../components/recipes/Recipe';

const Composed = adopt({
	// eslint-disable-next-line react/prop-types
	getCurrentRecipe: ({ render, id }) => (
		<Query
			notifyOnNetworkStatusChange
			query={ GET_CURRENT_RECIPE_QUERY }
			ssr={ false }
			variables={ { id } }
		>
			{render}
		</Query>
	),

	// eslint-disable-next-line react/prop-types
	getRecipes: ({ cursor = 0, render }) => (
		<Query
			notifyOnNetworkStatusChange
			query={ GET_PAGINATED_RECIPES_QUERY }
			ssr={ false }
			variables={ { cursor } }
		>
			{render}
		</Query>
	),

	// eslint-disable-next-line react/prop-types
	getRecipesCount: ({ render }) => (
		<Query
			fetchPolicy="cache-and-network"
			notifyOnNetworkStatusChange
			query={ GET_RECIPES_COUNT_QUERY }
			ssr={ false }
		>
			{render}
		</Query>
	),
});

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

class Recipes extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = { currentRecipeID: null };
	}

	onRecipeClick = (e, id) => {
		e.preventDefault();
		this.setState({ currentRecipeID: id });
	}

	onCloseClick = (e) => {
		e.preventDefault();
		this.setState({ currentRecipeID: null });
	}

	render() {
		const { currentRecipeID } = this.state;
		return (
			<Composed id={ currentRecipeID }>
				{
					({ getCurrentRecipe, getRecipes, getRecipesCount }) => {
						const { error, loading } = getRecipes;
						const { data } = getRecipesCount;
						const { recipeAggregate } = data || {};
						const { recipesCount } = recipeAggregate || {};
						const { recipes = {} } = getRecipes.data || {};
						const { fetchMore } = getRecipes;
						const { recipe = null } = getCurrentRecipe.data || {};
						// TODO re-implement initial loading component, but don't re-activate on subsequent loads
						return (
							<RecipesStyles>
								<Header pageHeader="Recipes" />
								<section>
									<Count className="right">
										{ recipesCount }
									</Count>

									{(error) ? <ErrorMessage error={ error } /> : null}

									{
										(loading && recipes && recipes.recipes && (recipes.recipes.length === 0))
											? <Loading name="recipes" />
											: null
									}

									<Grid
										count={ recipes.count || 0 }
										fetchMore={ fetchMore }
										recipes={ recipes.recipes || [] }
										onRecipeClick={ this.onRecipeClick }
									/>

									{
										(currentRecipeID && recipe)
											? <Recipe onCloseClick={ this.onCloseClick } recipe={ recipe } />
											: null
									}
									<AddNew />
								</section>
							</RecipesStyles>
						);
					}
				}
			</Composed>
		);
	}
}

Recipes.defaultProps = {};

Recipes.propTypes = { client: PropTypes.shape({ query: PropTypes.func }).isRequired };

export default withApollo(Recipes);
