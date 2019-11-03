import { adopt } from 'react-adopt';
import React from 'react';
import { Query } from 'react-apollo';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import ErrorMessage from '../ErrorMessage';
import Form from './Form';

import { GET_INGREDIENT_BY_ID_QUERY } from '../../lib/apollo/queries';

const Composed = adopt({
	// eslint-disable-next-line react/prop-types
	getIngredient: ({ render, id }) => (
		<Query query={ GET_INGREDIENT_BY_ID_QUERY } variables={ { id } }>
			{ render }
		</Query>
	),
});

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

class Card extends React.PureComponent {
	initialState = { isEditMode: false };

	constructor(props) {
		super(props);
		const { view } = props;
		this.state = { isEditMode: (view === 'new') };
	}

	onCancelClick = (e) => {
		e.preventDefault();
		this.setState(this.initialState);
	}

	onToggleEditMode = (e) => {
		e.preventDefault();
		const { isEditMode } = this.state;

		this.setState({ isEditMode: !isEditMode });
	}

	resetState = () => {
		this.setState(this.initialState);
	}

	render() {
		const { className, id } = this.props;
		const { isEditMode } = this.state;

		return (
			<Composed id={ id }>
				{
					({ getIngredient }) => {
						const { data, error, loading } = getIngredient || {};
						const { ingredient } = data || {};
						const {
							alternateNames, isComposedIngredient, name, plural, properties,
							relatedIngredients, substitutes, references,
						} = ingredient || {};
						if (error) return <ErrorMessage error={ error } />;

						return (
							<CardStyles className={ className }>
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
									substitutes={ substitutes }
								/>
							</CardStyles>
						);
					}
				}
			</Composed>
		);
	}
}

Card.defaultProps = { className: '' };

Card.propTypes = {
	className: PropTypes.string,
	id: PropTypes.string.isRequired,
	view: PropTypes.oneOf([ 'all', 'new' ]).isRequired,
};

export default Card;
