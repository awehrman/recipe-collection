import { useQuery } from '@apollo/client';
import { Map as ImmutableMap } from 'immutable';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import styled from 'styled-components';

import { GET_ALL_INGREDIENTS_QUERY } from '../lib/apollo/queries/ingredients';
import AddNew from '../components/ingredients/AddNew';
import Containers from '../components/ingredients/Containers';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';
import Filters from '../components/ingredients/Filters';
import Header from '../components/Header';
import ViewContext from '../lib/contexts/ingredients/viewContext';

const IngredientsPageStyles = styled.article`
`;

// TODO remove references from the ingredients query and just have the backend provide a count for us
// maybe do the same with parent since the recipe references are clogging up the cache

const Ingredients = ({ group, id, view }) => {
	// don't show the containers until we've downloaded all the ingredient info
	const [ showContainers, setShowContainers ] = useState(false);
	const context = new ImmutableMap({
		currentIngredientID: id,
		group,
		view,
	});

	// fetch the ingredients from the server
	const {
		error,
		loading,
	} = useQuery(GET_ALL_INGREDIENTS_QUERY, {
		// once we've fetched the ingredients, we can safely render the containers
		onCompleted: () => ((!showContainers) ? setShowContainers(true) : null),
	});

	return (
		<ViewContext.Provider value={ context }>
			<IngredientsPageStyles>
				<Header pageHeader="Ingredients" />
				<section>
					{/* view and group filters */}
					<Filters />

					{ (loading) ? <Loading name="ingredients" /> : null }
					{ (error) ? <ErrorMessage error={ error } /> : null }

					{/* show the containers once they're available in the cache */
						(!loading && showContainers)
							? <Containers />
							: null
					}

					{/* add new ingredient form */}
					<AddNew view={ view } />
				</section>
			</IngredientsPageStyles>
		</ViewContext.Provider>
	);
};

// NOTE: so basically anytime i utilize apollo, it's going to cause an unnecessary re-render
// i'm hoping this will be resolved once i do some package upgrading bc slapping a useMemo
// on the client given to the ApolloProvider in _app BREAKS ALL SORTS OF SHIT

// Ingredients.whyDidYouRender = true;

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
