import { adopt } from 'react-adopt';
import { Component } from 'react';
import { darken } from 'polished';
import { Query, Mutation } from 'react-apollo';
// import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import gql from 'graphql-tag';
// import levenshtein from 'fast-levenshtein';
// import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import styled from 'styled-components';

// import faEdit from '@fortawesome/fontawesome-pro-regular/faEdit';
// import faCodeMerge from '@fortawesome/fontawesome-pro-light/faCodeMerge';
// import faExclamation from '@fortawesome/fontawesome-pro-solid/faExclamation';
// import faPlus from '@fortawesome/fontawesome-pro-regular/faPlus';

// import Button from '../form/Button';
// import CheckboxGroup from '../form/CheckboxGroup';
import ErrorMessage from '../ErrorMessage';
// import Input from '../form/Input';
// import List from '../form/List';
// import Modal from '../form/Modal';

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

const IngredientForm = styled.form`
	flex-basis: 100%;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;

	.bottom {
		margin-top: auto; /* stick to the bottom of the card */

		.warning {
			color: tomato;
			margin-bottom: 10px;
			font-weight: 600;
			font-size: 13px;
		}

		.right {
			margin-top: auto;
		}
	}

	button {
		border: 0;
		background: transparent;
		cursor: pointer;
		font-weight: 600;
		font-size: 14px;
	}

	fieldset {
		margin-bottom: 10px;
	}

	fieldset input {
	 	border-bottom: 0;
	}

	fieldset.plural {
		height: 20px;
	}

	button.edit {
		border: 0;
		background: transparent;
		cursor: pointer;
		color: ${ props => props.theme.highlight };
		font-weight: 600;
		font-size: 14px;

	 	svg {
			margin-right: 8px;
		}
	}

	button.cancel {
		color: #ccc;
		font-weight: 400;
		margin-right: 10px;
	}

	button.save {
		background: ${ props => props.theme.altGreen };
		color: white;
		border-radius: 5px;
		padding: 4px 10px;

		&:hover {
			background: ${ props => darken(0.1, props.theme.altGreen) };
		}
	}

	button.merge {
		color: ${ props => props.theme.highlight };
	}

	button.parent {
		color: ${ props => props.theme.orange };
	}

	button.parsingError {
		color: tomato;
	}

	.actions {
		display: flex;
		flex-direction: column;
		align-items: flex-start;

		button {
			margin-bottom: 6px;

			svg {
				margin-right: 10px;
			}
		}
	}

	@media (min-width: ${ props => props.theme.desktopCardWidth }) {
		fieldset {
			margin-bottom: 6px;
		}

		.top {
			display: flex;
			justify-content: space-between;
			margin-bottom: 20px;

			.left {
				flex-grow: 1;
			}

			.right {
				text-align: right;
				flex-shrink: 2;

				fieldset.isComposedIngredient {
					margin-top: 14px;
				}
			}
		}

		.middle {
			display: flex;
			justify-content: space-between;
			margin-bottom: 20px;

			/* TEMP - go back and look and what's causing the differences between these svg icons here and in the create component */
			button.add {
				top: -1px;
			}

			.right {
				flex: 1;

				ul.list {
					max-height: 108px;
					overflow-y: scroll;
				}
			}

			.left {
				flex: 1;
			}
		}

		.bottom {
			display: flex;
			justify-content: flex-end;

			.left {
				flex: 1;
			}

			.right {
				flex: 1;
				text-align: right;
				flex-grow: 2;
			}
		}
	}
`;

// TODO there is so much duplicated code between this and the create component;
// see if we can DRY this up

class Card extends Component {
	initialState = {};

	state = this.initialState;

	render() {
		const { id } = this.props;
		console.warn('[Card] render');
		return (
			<Composed id={ id }>
				{
					({ getIngredient }) => {
						const { data, error, loading } = getIngredient || {};
						const { ingredient } = data;
						console.log(ingredient);

						if (error) return <ErrorMessage error={ error } />;

						return (
							<CardStyles>
								<IngredientForm>TODO</IngredientForm>
							</CardStyles>
						);
					}
				}
			</Composed>
		);
	}
}

Card.defaultProps = {};

Card.propTypes = { id: PropTypes.string.isRequired };

export default Card;
export {
	CURRENT_INGREDIENT_QUERY,
	UPDATE_INGREDIENT_MUTATION,
};
