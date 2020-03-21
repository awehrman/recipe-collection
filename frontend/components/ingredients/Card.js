import { useQuery } from '@apollo/client';
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import ErrorMessage from '../ErrorMessage';
// import Form from './Form';
import { GET_INGREDIENT_QUERY } from '../../lib/apollo/queries/ingredients';

const CardStyles = styled.div`
	max-height: ${ (props) => (props.theme.mobileCardHeight) };
	padding: 20px;
	border-bottom: 1px solid #ddd;
	width: 100%;
	display: flex;
	position: relative;

	&.hidden {
		display: none;
	}

	@media (min-width: ${ (props) => (props.theme.desktopCardWidth) }) {
		flex-basis: 70%;
		flex-grow: 2;
		order: 1;
		max-height: ${ (props) => (props.theme.desktopCardHeight) };
		border-left: 1px solid #ddd;
		border-bottom: 0;
	}
`;
const Card = ({ className, id }) => {
	console.log('Card', id);

	// query container
	const {
		data,
		loading,
		error,
	} = useQuery(GET_INGREDIENT_QUERY, {
		variables: { id },
	});
	const { ingredient } = data || {};
	console.log({ loading, ingredient });
	return (
		<CardStyles className={ className }>
			{ (error) ? <ErrorMessage error={ error } /> : null }
			{/*
				<Form
					alternateNames={ alternateNames }
					id={ (ingredient) ? ingredient.id : null }
					isComposedIngredient={ isComposedIngredient }
					isEditMode={ isEditMode }
					key={ (ingredient) ? ingredient.id : 'empty' }
					loading={ loading }
					name={ name }
					onCancelClick={ this.onCancelClick }
					onEditClick={ this.onToggleEditMode }
					onSaveCallback={ this.resetState }
					plural={ plural }
					properties={ properties }
					showCancelButton
					relatedIngredients={ relatedIngredients }
					references={ references }
					showNextCard={ showNextCard }
					substitutes={ substitutes }
				/>
			*/}
		</CardStyles>
	);
};

Card.defaultProps = { className: '' };

Card.propTypes = {
	className: PropTypes.string,
	id: PropTypes.string.isRequired,
};

export default Card;
