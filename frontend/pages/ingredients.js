import { useQuery } from '@apollo/client';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import styled from 'styled-components';

import { GET_INGREDIENTS_COUNT_QUERY, GET_ALL_INGREDIENTS_QUERY } from '../lib/apollo/queries/ingredients';
import AddNew from '../components/ingredients/AddNew';
import Containers from '../components/ingredients/Containers';
import ErrorMessage from '../components/ErrorMessage';
import Filters from '../components/ingredients/Filters';
import Header from '../components/Header';
import Loading from '../components/Loading';
import IngredientsContext from '../lib/contexts/ingredientsContext';

const IngredientsPageStyles = styled.article`
`;

// TODO remove references from the ingredients query and just have the backend provide a count for us
// maybe do the same with parent since the recipe references are clogging up the cache

const Ingredients = ({ group, id, view }) => {
	// don't show the containers until we've populated them
	const [ showContainers, setShowContainers ] = useState(false);

	// store our query param props in our context
	const context = {
		currentIngredientID: id, // TODO consider converting this to an array; we may have multiple ingredients open in different containers
		group,
		view,
	};

	// fetch the ingredient totals
	const {
		data: countData,
		loading: countLoading,
		error: countError,
	} = useQuery(GET_INGREDIENTS_COUNT_QUERY);
	const { ingredientAggregate } = countData || {};
	const { count = 0, unverified = 0 } = ingredientAggregate || {};

	// fetch the ingredients from the server
	// then go thru our local query resolver to create or update the containers
	const {
		error,
		loading,
	} = useQuery(GET_ALL_INGREDIENTS_QUERY, {
		// once we've fetched the ingredients, we can safely render the containers
		onCompleted: () => (!showContainers && setShowContainers(true)),
	});
	// console.log('[ingredients] render', (!loading && showContainers), (loading || countLoading) ? 'loading...' : 'finished');

	return (
		<IngredientsContext.Provider value={ context }>
			<IngredientsPageStyles>
				<Header pageHeader="Ingredients" />
				<section>
					{/* view and group filters */}
					<Filters
						count={ count }
						newCount={ unverified }
					/>

					{/* loading ingredients message */
						(loading || countLoading)
							? <Loading name="ingredients" />
							: null
					}

					{/* error message */
						(error || countError)
							? <ErrorMessage error={ error || countError } />
							: null
					}

					{/* show the containers once they're available in the cache */
						(!loading && showContainers)
							? <Containers />
							: null
					}

					{/* add new ingredient form */}
					<AddNew view={ view } />
				</section>
			</IngredientsPageStyles>
		</IngredientsContext.Provider>
	);
};

Ingredients.defaultProps = {
	group: 'name',
	id: null,
	view: 'all',
};

Ingredients.propTypes = {
	group: PropTypes.string,
	id: PropTypes.string,
	view: PropTypes.string,
};

export default Ingredients;
