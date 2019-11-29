import { adopt } from 'react-adopt';
import React from 'react';
import { Query, withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { GET_PAGINATED_RECIPES_QUERY, GET_RECIPES_COUNT_QUERY } from '../lib/apollo/queries';

import AddNew from '../components/recipes/AddNew';
import ErrorMessage from '../components/ErrorMessage';
import Header from '../components/Header';
import Grid from '../components/recipes/Grid';

const Composed = adopt({
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
	render() {
		return (
			<Composed>
				{
					({ getRecipes, getRecipesCount }) => {
						const { error } = getRecipes;
						const { data } = getRecipesCount;
						const { recipeAggregate } = data || {};
						const { recipesCount } = recipeAggregate || {};
						const { recipes = {} } = getRecipes.data || {};
						const { fetchMore } = getRecipes;
						if (recipes && recipes.recipes) {
							console.log([ ...recipes.recipes.map((r) => r.title) ]);
							console.log({ getRecipes });
						}
						// TODO re-implement initial loading component, but don't re-activate on subsequent loads
						return (
							<RecipesStyles>
								<Header pageHeader="Recipes" />
								<section>
									<Count className="right">
										{ recipesCount }
									</Count>

									{(error) ? <ErrorMessage error={ error } /> : null}

									<Grid
										count={ recipes.count || 0 }
										fetchMore={ fetchMore }
										recipes={ recipes.recipes || [] }
									/>

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
