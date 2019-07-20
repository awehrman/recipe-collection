import { adopt } from 'react-adopt';
import gql from 'graphql-tag';
import { Component } from 'react';
import { Query, Mutation, withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import AddNew from '../components/ingredients/AddNew';
import Containers from '../components/ingredients/Containers';
import ErrorMessage from '../components/ErrorMessage';
import Header from '../components/Header';
import Filters from '../components/ingredients/Filters';

const GET_INGREDIENTS_COUNT_QUERY = gql`
  query GET_INGREDIENTS_COUNT_QUERY {
  	ingredientAggregate {
	  	ingredientsCount
			newIngredientsCount
		}
  }
`;

const GET_ALL_INGREDIENTS_QUERY = gql`
  query GET_ALL_INGREDIENTS_QUERY {
  	ingredients {
  		id
			name
			plural
			alternateNames {
				name
			}
			properties {
				meat
			  poultry
			  fish
			  dairy
			  soy
			  gluten
			}
			parent {
				id
			}
			isComposedIngredient
			isValidated
		}
  }
`;

const UPDATE_CONTAINERS_MUTATION = gql`
	mutation updateContainers(
		$group: String
		$view: String
	) {
		updateContainers(
			group: $group
			view: $view
		) @client
	}
`;

const Composed = adopt({
	// eslint-disable-next-line react/prop-types
	getIngredients: ({ render }) => (
		// this may take a moment so disable SSR
		<Query query={ GET_ALL_INGREDIENTS_QUERY } ssr={ false }>
			{ render }
		</Query>
	),

	// eslint-disable-next-line react/prop-types
	getIngredientCounts: ({ render }) => (
		<Query query={ GET_INGREDIENTS_COUNT_QUERY }>
			{ render }
		</Query>
	),

	// eslint-disable-next-line react/prop-types
	updateContainers: ({ render, variables }) => (
		<Mutation mutation={ UPDATE_CONTAINERS_MUTATION } variables={ variables }>
			{ render }
		</Mutation>
	),
});

const IngredientsPageStyles = styled.article`
	// TODO slide out/in AddNew panel
	.loading {
		margin-top: 10px;
	}
`;

class Ingredients extends Component {
	constructor(props) {
		super(props);

		this.state = { isAddNewExpanded: false };
	}

	onToggleAddNew = (e) => {
		e.preventDefault();
		const { isAddNewExpanded } = this.state;

		this.setState({ isAddNewExpanded: !isAddNewExpanded });
	}

	render() {
		console.warn('[ingredients] render');
		const { query } = this.props;
		const { isAddNewExpanded } = this.state;
		const { group = 'name', id = null, view = 'all' } = query;

		return (
			// pass our local mutation to getIngredients onCompleted
			// so that we can instantiate our containers based on the URL variables from above
			// eslint-disable-next-line
			<Composed variables={ { currentIngredientID: id, group, view } }>
				{
					({ getIngredients, getIngredientCounts, updateContainers }) => {
						const { error } = getIngredients || {};
						const { loading } = getIngredients || true;

						const { data } = getIngredientCounts || {};
						const { ingredientAggregate } = data || {};
						const { ingredientsCount, newIngredientsCount } = ingredientAggregate || {};
						// eslint-disable-next-line
						console.log({ getIngredients, getIngredientCounts });

						return (
							<IngredientsPageStyles>
								<Header pageHeader="Ingredients" />
								<section>
									{/* View and Group Filters */}
									<Filters
										group={ group }
										ingredientsCount={ ingredientsCount }
										newIngredientsCount={ newIngredientsCount }
										view={ view }
									/>

									{/* Error Messages */}
									{ (error) ? <ErrorMessage error={ error } /> : null }

									{/* Loading Message or Containers
											TODO fix styling jump
									*/}

									{
										(loading)
											? <div className="loading">Loading ingredients...</div>
											: (
												<Containers
													currentIngredientID={ id }
													group={ group }
													view={ view }
													updateContainers={ updateContainers }
												/>
											)
									}
									{/* Add New Ingredient */}
									<AddNew
										className={ `slide${ isAddNewExpanded ? '_expanded' : '' }` }
										isExpanded={ isAddNewExpanded }
										onClick={ this.onToggleAddNew }
									/>
								</section>
							</IngredientsPageStyles>
						);
					}
				}
			</Composed>
		);
	}
}

Ingredients.defaultProps = {
	query: {
		group: 'name',
		id: null,
		view: 'all',
	},
};

Ingredients.propTypes = {
	query: PropTypes.shape({
		group: PropTypes.oneOf([ 'name', 'property', 'relationship', 'count' ]),
		id: PropTypes.string,
		view: PropTypes.oneOf([ 'all', 'new' ]),
	}),
};

export default withApollo(Ingredients);
export {
	GET_ALL_INGREDIENTS_QUERY,
	GET_INGREDIENTS_COUNT_QUERY,
};
