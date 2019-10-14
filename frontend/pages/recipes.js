import { adopt } from 'react-adopt';
import React from 'react';
import { Query, withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { GET_ALL_RECIPES_QUERY, GET_RECIPES_COUNT_QUERY } from '../lib/apollo/queries';

import AddNew from '../components/recipes/AddNew';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';
import Header from '../components/Header';

const Composed = adopt({
	// eslint-disable-next-line react/prop-types
	getRecipes: ({ render }) => (
		<Query query={ GET_ALL_RECIPES_QUERY }>
			{render}
		</Query>
	),

	// eslint-disable-next-line react/prop-types
	getRecipesCount: ({ render }) => (
		<Query query={ GET_RECIPES_COUNT_QUERY }>
			{render}
		</Query>
	),
});

const RecipesStyles = styled.article`
`;

class Recipes extends React.PureComponent {
	refreshRecipes = () => {
		const { client } = this.props;

		const queries = [
			{ query: GET_ALL_RECIPES_QUERY },
			{ query: GET_RECIPES_COUNT_QUERY },
		];

		return Promise.all(queries.map(q => client.query(
			Object.assign({}, q, { fetchPolicy: 'network-only' }),
		)));
	}

	render() {
		return (
			<Composed>
				{
					({ getRecipes, getRecipesCount }) => {
						const { error, loading } = getRecipes;
						const { data } = getRecipesCount || {};
						const { recipeAggregate } = data || {};
						const { recipesCount } = recipeAggregate || {};
						const { data: { recipes = [] } } = getRecipes;

						return (
							<RecipesStyles>
								<Header pageHeader="Recipes" />
								<section>
									{ recipesCount }

									{(error) ? <ErrorMessage error={ error } /> : null}

									{
										(loading)
											? <Loading name="recipes" />
											: (
												<ul>
													{
														recipes.map(r => (
															<li key={ r.id }>
																{ r.title }
															</li>
														))
													}
												</ul>
											)
									}

									<AddNew refreshRecipes={ this.refreshRecipes } />
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
