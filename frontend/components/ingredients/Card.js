import { adopt } from 'react-adopt';
import React from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { deepCopy } from '../../lib/util';
import ErrorMessage from '../ErrorMessage';
import Form from './Form';

const CURRENT_INGREDIENT_QUERY = gql`
  query CURRENT_INGREDIENT_QUERY($id: ID!) {
		ingredient(where: { id: $id }) {
			id
			parent {
				id
				name
			}
			name
			plural
			properties {
				meat
				poultry
				fish
				dairy
				soy
				gluten
			}
			alternateNames {
				name
			}
			relatedIngredients {
				id
				name
			}
			substitutes {
				id
				name
			}
			references {
				id
				reference
			}
			isValidated
      isComposedIngredient
		}
	}
`;

const UPDATE_INGREDIENT_MUTATION = gql`
  mutation UPDATE_INGREDIENT_MUTATION(
  	$id: ID!
    $name: String
    $plural: String
    $properties: PropertyUpdateDataInput
		$alternateNames_Create: [ String ]
		$alternateNames_Delete: [ String ]
		$relatedIngredients_Connect: [ ID ]
		$relatedIngredients_Disconnect: [ ID ]
		$substitutes_Connect: [ ID ]
		$substitutes_Disconnect: [ ID ]
		$isValidated: Boolean
		$isComposedIngredient: Boolean
  ) {
    updateIngredient(
    	id: $id
      name: $name
      plural: $plural
      properties: {
      	update: $properties
      }
	    alternateNames_Create: $alternateNames_Create
	    alternateNames_Delete: $alternateNames_Delete
	    relatedIngredients_Connect: $relatedIngredients_Connect
	    relatedIngredients_Disconnect: $relatedIngredients_Disconnect
	    substitutes_Connect: $substitutes_Connect
	    substitutes_Disconnect: $substitutes_Disconnect
	    isValidated: $isValidated
	    isComposedIngredient: $isComposedIngredient
    ) {
      id
			parent {
				id
				name
			}
			name
			plural
			properties {
				meat
				poultry
				fish
				dairy
				soy
				gluten
			}
			alternateNames {
				name
			}
			relatedIngredients {
				id
				name
			}
			substitutes {
				id
				name
			}
			references {
				id
				reference
			}
			isValidated
      isComposedIngredient
    }
  }
`;

const Composed = adopt({
	// eslint-disable-next-line react/prop-types
	getIngredient: ({ render, id }) => (
		<Query query={ CURRENT_INGREDIENT_QUERY } variables={ { id } }>{ render }</Query>
	),
	// eslint-disable-next-line react/prop-types
	updateIngredient: ({ render }) => (
		<Mutation mutation={ UPDATE_INGREDIENT_MUTATION }>{ render }</Mutation>
	),
});

const CardStyles = styled.div`
	max-height: ${ props => (props.theme.mobileCardHeight) };
	padding: 20px;
	border-bottom: 1px solid #ddd;
	width: 100%;
	display: flex;
	position: relative;

	&.hidden {
		display: none;
	}

	@media (min-width: ${ props => (props.theme.desktopCardWidth) }) {
		flex-basis: 70%;
		flex-grow: 2;
		order: 1;
		max-height: ${ props => (props.theme.desktopCardHeight) };
		border-left: 1px solid #ddd;
		border-bottom: 0;
	}
`;

class Card extends React.PureComponent {
	initialState = { isEditMode: false };

	// eslint-disable-next-line react/destructuring-assignment
	state = { isEditMode: (this.props.view === 'new') };

	onCancelClick = (e) => {
		e.preventDefault();
		this.setState(this.initialState);
	}

	onToggleEditMode = (e) => {
		e.preventDefault();
		const { isEditMode } = this.state;

		this.setState({ isEditMode: !isEditMode });
	}

	onSaveIngredient = (e, updates = {}) => {
		console.warn('[Card] onSaveIngredient');
		e.preventDefault();
		const pending = deepCopy(updates);

		pending.isValidated = true;

		// TODO mutation
		this.setState(this.initialState);

		// TODO make sure that we get the containers to refresh on save as well
	}

	render() {
		const { className, id } = this.props;
		const { isEditMode } = this.state;
		console.warn('[Card] render');

		return (
			<Composed id={ id }>
				{
					({ getIngredient }) => {
						const { data, error, loading } = getIngredient || {};
						const { ingredient } = data || {};
						const {
							alternateNames, isComposedIngredient, name, plural, properties,
							relatedIngredients, substitutes,
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
									onSaveIngredient={ this.onSaveIngredient }
									plural={ plural }
									properties={ properties }
									showCancelButton
									relatedIngredients={ relatedIngredients }
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
export {
	CURRENT_INGREDIENT_QUERY,
	UPDATE_INGREDIENT_MUTATION,
};
