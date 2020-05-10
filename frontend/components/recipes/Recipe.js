import { withRouter } from 'next/router';
import { useQuery } from '@apollo/react-hooks';
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { GET_RECIPE_QUERY } from '../../lib/apollo/queries/recipes';

import ErrorMessage from '../common/ErrorMessage';
import Form from './Form';

const onCloseClick = (router) => {
	console.log('onCloseClick', { router });
	// TODO unset currentRecipeID
	router.replace('/recipes', '/recipes', { shallow: true });
};

const Recipe = ({ id, router }) => {
	// fetch the recipe
	const {
		data,
		loading,
		error,
	} = useQuery(GET_RECIPE_QUERY, { variables: { id } });
	// eslint-disable-next-line object-curly-newline
	console.log({ data, error, loading });
	const { recipe = {} } = data || {};
	const {
		evernoteGUID = null,
		image,
		ingredients = [],
		instructions = [],
		source = null,
		title,
	} = recipe;

	return (
		<RecipeStyles>
			{
				(error)
					? <ErrorMessage error={ error } />
					: null
			}
			<Form
				className="recipe"
				key="current-recipe"
				saveLabel="Save"
				evernoteGUID={ evernoteGUID }
				id={ id }
				image={ image }
				ingredients={ ingredients }
				instructions={ instructions }
				isEditMode={ false }
				isFormReset={ false }
				loading={ loading }
				onCloseClick={ () => onCloseClick(router) }
				showCancelButton
				showCloseButton
				source={ source }
				title={ title }
			/>
		</RecipeStyles>
	);
};

Recipe.propTypes = {
	id: PropTypes.string.isRequired,
	router: PropTypes.shape({}).isRequired,
};

export default withRouter(Recipe);

const RecipeStyles = styled.div`
	background: white;
	position: absolute;
	top: 100px;
	bottom: 0;
	left: 40px;
	right: 40px;
	display: flex;
	justify-content: center;
	align-items: flex-start;

	@media (min-width: ${ (props) => props.theme.tablet }) {
		right: 80px;
	}
`;
