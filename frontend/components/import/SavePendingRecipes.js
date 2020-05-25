import React from 'react';
import styled from 'styled-components';

import { withApollo } from '../../lib/apollo';

const SavePendingRecipes = () => {
	// TODO

	return (
		<SavePendingRecipesStyles>
			SavePendingRecipes
		</SavePendingRecipesStyles>
	);
};

SavePendingRecipes.whyDidYouRender = true;

export default withApollo({ ssr: true })(SavePendingRecipes);

const SavePendingRecipesStyles = styled.div``;
