import { adopt } from 'react-adopt';
import gql from 'graphql-tag';
import { Component } from 'react';
import { Query, withApollo } from 'react-apollo';
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

const Composed = adopt({
	// eslint-disable-next-line react/prop-types
	getIngredients: ({ render }) => (
		// this may take a moment so disable SSR
		<Query query={ GET_ALL_INGREDIENTS_QUERY } ssr={ false }>
			{render}
		</Query>
	),

	// eslint-disable-next-line react/prop-types
	getIngredientCounts: ({ render }) => (
		<Query query={ GET_INGREDIENTS_COUNT_QUERY }>
			{render}
		</Query>
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
			// eslint-disable-next-line
			<Composed variables={{ group, ingredientID: id, view }}>
				{
					({ getIngredients, getIngredientCounts }) => {
						const { error } = getIngredients || {};
						const { loading } = getIngredients || true;

						const { data } = getIngredientCounts || {};
						const { ingredientAggregate } = data || {};
						const { ingredientsCount, newIngredientsCount } = ingredientAggregate || {};

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
												/>
											)
									}

									{/* Add New Ingredient */}
									<AddNew
										className={ `slide${ isAddNewExpanded ? '_expanded' : '' }` }
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
