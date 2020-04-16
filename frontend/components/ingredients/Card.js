import { useQuery } from '@apollo/client';
import React, { memo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/pro-regular-svg-icons';

import { actions } from '../../reducers/ingredient';

import Button from '../form/Button';
import ErrorMessage from '../ErrorMessage';
import IngredientForm from './IngredientForm';
import { GET_INGREDIENT_QUERY } from '../../lib/apollo/queries/ingredients';
import useIngredientForm from './form/useIngredientForm';

const CardStyles = styled.div`
	height: ${ (props) => (props.theme.mobileCardHeight) };
	padding: 20px;
	border-bottom: 1px solid #ddd;
	width: 100%;
	display: flex;
	position: relative;

	&.hidden {
		display: none;
	}

	button.edit {
		border: 0;
		background: transparent;
		cursor: pointer;
		color: ${ (props) => props.theme.highlight };
		font-weight: 600;
		font-size: 14px;

	 	svg {
			margin-right: 8px;
			height: 14px;
		}
	}

	@media (min-width: ${ (props) => (props.theme.desktopCardWidth) }) {
		flex-basis: 70%;
		flex-grow: 2;
		order: 1;
		height: ${ (props) => (props.theme.desktopCardHeight) };
		border-left: 1px solid #ddd;
		border-bottom: 0;
	}
`;

const Card = ({ className, id, name }) => {
	// setup our form helpers
	const formUtilities = useIngredientForm({
		id,
		name,
	});
	const {
		dispatch,
		isEditMode,
		setEditMode,
	} = formUtilities;

	// query the full ingredient from the server so that our form can pull it straight from the cache
	const { error } = useQuery(GET_INGREDIENT_QUERY, {
		onCompleted: async ({ ingredient }) => {
			// populate form with ingredient information
			dispatch({
				type: actions.loadIngredient,
				payload: { ...ingredient },
			});
		},
		variables: { id },
	});

	console.log({ formUtilities });
	return (
		<CardStyles className={ className }>
			{/* Error Message */}
			{ (error) ? <ErrorMessage error={ error } /> : null }

			{/* Ingredient Form
			<IngredientForm
				className="card"
				id={ id }
				name={ name }
			/>
			 */}

			{/* Edit Button */
				(!isEditMode)
					? (
						<Button
							className="edit"
							icon={ <FontAwesomeIcon icon={ faEdit } /> }
							label="Edit"
							onClick={ () => setEditMode(true) }
						/>
					) : null
			}
		</CardStyles>
	);
};

Card.whyDidYouRender = true;

Card.defaultProps = {
	className: '',
	name: '',
};

Card.propTypes = {
	className: PropTypes.string,
	id: PropTypes.string.isRequired,
	name: PropTypes.string,
};

export default memo(Card);
