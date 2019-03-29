import { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
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

const IngredientsPageStyles = styled.article`
	// TODO look into react transitions some more
`;

class Ingredients extends Component {
	constructor(props) {
		super(props);

		this.state = { isAddNewExpanded: false };
	}

	onToggleAddNew = (e) => {
		console.warn('onToggleAddNew');
		e.preventDefault();
		const { isAddNewExpanded } = this.state;

		this.setState({ isAddNewExpanded: !isAddNewExpanded });
	}

	render() {
		const { query } = this.props;
		const { isAddNewExpanded } = this.state;
		// console.warn('[ingredients] render');
		const { group, id, view } = query;

		return (
			<Query query={ GET_INGREDIENTS_COUNT_QUERY }>
				{
					({ loading, error, data }) => {
						console.log(data);
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

									{/* Error and Loading Messages */}
									{ (loading) ? <div className="loading">Loading ingredients...</div> : null }
									{ (error) ? <ErrorMessage error={ error } /> : null }

									{/* Containers */}
									<Containers
										group={ group }
										id={ id }
										view={ view }
									/>

									{/* Add New Ingredient */}
									<AddNew
										isExpanded={ isAddNewExpanded }
										onClick={ this.onToggleAddNew }
									/>
								</section>
							</IngredientsPageStyles>
						);
					}
				}
			</Query>
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

export default Ingredients;
export { GET_INGREDIENTS_COUNT_QUERY };
