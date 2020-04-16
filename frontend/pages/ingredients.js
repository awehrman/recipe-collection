// import { useQuery } from '@apollo/client';
import { Map as ImmutableMap } from 'immutable';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
/*
import AddNew from '../components/ingredients/AddNew';
import Containers from '../components/ingredients/Containers';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';
*/
import Filters from '../components/ingredients/Filters';
import Header from '../components/Header';
import ViewContext from '../lib/contexts/ingredients/viewContext';

const IngredientsPageStyles = styled.article`
`;

// TODO remove references from the ingredients query and just have the backend provide a count for us
// maybe do the same with parent since the recipe references are clogging up the cache

const Ingredients = ({ group, id, view }) => {
	// don't show the containers until we've populated them
	// const [ showContainers, setShowContainers ] = useState(false);
	const context = new ImmutableMap({
		currentIngredientID: id, // TODO consider converting this to an array; we may have multiple ingredients open in different containers
		group,
		view,
	});
/*
	// fetch the ingredients from the server
	// then go thru our local query resolver to create or update the containers
	const {
		error,
		loading,
	} = useQuery(GET_ALL_INGREDIENTS_QUERY, {
		// once we've fetched the ingredients, we can safely render the containers
		onCompleted: () => ((!showContainers) ? setShowContainers(true) : null),
	});
	*/

	return (
		<ViewContext.Provider value={ context }>
			<IngredientsPageStyles>
				<Header pageHeader="Ingredients" />
				<section>
					{/* view and group filters */}
					<Filters />

					{/* loading ingredients message
						(loading || countLoading)
							? <Loading name="ingredients" />
							: null
					 */}

					{/* error message
						(error || countError)
							? <ErrorMessage error={ error || countError } />
							: null
					 */}

					{/* show the containers once they're available in the cache
						(!loading && showContainers)
							? <Containers />
							: null
					 */}

					{/* add new ingredient form
					<AddNew view={ view } />
					 */}
				</section>
			</IngredientsPageStyles>
		</ViewContext.Provider>
	);
};

// NOTE: i'm pretty sure this is yelling about apollo client
// https://github.com/apollographql/react-apollo/issues/3595
// whenever i get around to updating next i can try to swap out my _app for a functional
// component that will allow me to try useMemo around the apollo client
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
