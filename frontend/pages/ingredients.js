import { useQuery } from '@apollo/react-hooks';
import { Map as ImmutableMap } from 'immutable';
import { withRouter } from 'next/router';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import styled from 'styled-components';

import { GET_ALL_INGREDIENTS_QUERY } from '../lib/apollo/queries/ingredients';
import AddNew from '../components/ingredients/AddNew';
import Containers from '../components/ingredients/Containers';
import ErrorMessage from '../components/common/ErrorMessage';
import Loading from '../components/common/Loading';
import Filters from '../components/ingredients/Filters';
import Header from '../components/Header';
import ValidationContext from '../lib/contexts/ingredients/validationContext';
import ViewContext from '../lib/contexts/ingredients/viewContext';
import { withApollo } from '../lib/apollo';

// TODO remove references from the ingredients query and just have the backend provide a count for us
// maybe do the same with parent since the recipe references are clogging up the cache

// TODO move this elsewhere
const buildValidationList = (ingredients = []) => {
	const list = ingredients
		.map((i) => [ i.name, i.plural, i.alternateNames.map((a) => a.name) ])
		.flat()
		.filter((i) => i && i.length) || [];

	// TODO idk maybe sort and break into alphabetized arrays? this is going to get stupid real fast...
	return list;
};

const Ingredients = ({ router }) => {
	const group = router?.query?.group || 'name';
	const view = router?.query?.view || 'all';
	const id = router?.query?.id || null;
	// don't show the containers until we've downloaded all the ingredient info
	const [ showContainers, setShowContainers ] = useState(false);
	const context = ImmutableMap({
		currentIngredientID: id,
		group,
		view,
	});

	// fetch the ingredients from the server
	const {
		data,
		error,
		loading,
	} = useQuery(GET_ALL_INGREDIENTS_QUERY, {
		// once we've fetched the ingredients, we can safely render the containers
		onCompleted: () => ((!showContainers) ? setShowContainers(true) : null),
	});

	const { ingredients = [] } = data || {};

	const message = (view === 'new')
		? 'No new ingredients to review.'
		: 'No ingredients have been added yet.';

	return (
		<ViewContext.Provider value={ context }>
			<ValidationContext.Provider value={ buildValidationList(ingredients) }>
				<IngredientsPageStyles>
					<Header pageHeader="Ingredients" />
					<section>
						{/* view and group filters */}
						<Filters />

						{loading ? <Loading name="ingredients" /> : null}
						{error ? <ErrorMessage error={ error } /> : null}

						{/* show the containers once they're available in the cache */
							!loading && showContainers ? <Containers /> : null
						}

						{/* no ingredients message */
							(!loading && !ingredients.length)
								? <span className="message">{ message }</span>
								: null
						}

						{/* add new ingredient form */}
						<AddNew view={ view } />
					</section>
				</IngredientsPageStyles>
			</ValidationContext.Provider>
		</ViewContext.Provider>
	);
};

Ingredients.defaultProps = {
	router: {
		query: {
			group: 'name',
			id: null,
			view: 'all',
		},
	},
};

Ingredients.propTypes = {
	router: PropTypes.shape({
		query: PropTypes.shape({
			group: PropTypes.string,
			id: PropTypes.string,
			view: PropTypes.string,
		}),
	}),
};

// NOTE: so basically anytime i utilize apollo, it's going to cause an unnecessary re-render
// i'm hoping this will be resolved once i do some package upgrading bc slapping a useMemo
// on the client given to the ApolloProvider in _app BREAKS ALL SORTS OF SHIT

Ingredients.whyDidYouRender = true;

export default withRouter(withApollo({ ssr: true })(Ingredients));

const IngredientsPageStyles = styled.article``;
