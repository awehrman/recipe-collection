import { adopt } from 'react-adopt';
import React from 'react';
import { Query, withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { GET_PAGINATED_RECIPES_QUERY, GET_RECIPES_COUNT_QUERY } from '../lib/apollo/queries';

import AddNew from '../components/recipes/AddNew';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';
import Header from '../components/Header';
import Grid from '../components/recipes/Grid';

const Composed = adopt({
	// eslint-disable-next-line react/prop-types
	getRecipes: ({ limit = 10, offset = 0, render }) => (
		<Query
			fetchPolicy="cache-and-network"
			query={ GET_PAGINATED_RECIPES_QUERY }
			ssr={ false }
			variables={ {
				offset,
				limit,
			} }
		>
			{render}
		</Query>
	),

	// eslint-disable-next-line react/prop-types
	getRecipesCount: ({ render }) => (
		<Query query={ GET_RECIPES_COUNT_QUERY } ssr={ false } fetchPolicy="cache-and-network">
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

		this.state = {
			limit: 12,
			offset: 0,
		};
	}

	refreshRecipes = () => {
		const { client } = this.props;

		const queries = [
			{ query: GET_PAGINATED_RECIPES_QUERY }, // TODO variables?
			{ query: GET_RECIPES_COUNT_QUERY },
		];

		return Promise.all(queries.map((q) => client.query(
			// eslint-disable-next-line prefer-object-spread
			Object.assign({}, q, { fetchPolicy: 'network-only' }), // TODO is this the best way to do this?
		)));
	}

	render() {
		const { limit, offset } = this.state;

		return (
			<Composed limit={ limit } offset={ offset }>
				{
					({ getRecipes, getRecipesCount }) => {
						const { error, loading } = getRecipes;
						const { data } = getRecipesCount || {};
						const { recipeAggregate } = data || {};
						const { recipesCount } = recipeAggregate || {};
						const { recipes = [] } = getRecipes.data || {};

						return (
							<RecipesStyles>
								<Header pageHeader="Recipes" />
								<section>
									<Count className="right">
										{ recipesCount }
									</Count>

									{(error) ? <ErrorMessage error={ error } /> : null}

									{
										(loading)
											? <Loading name="recipes" />
											: <Grid recipes={ recipes } />
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
