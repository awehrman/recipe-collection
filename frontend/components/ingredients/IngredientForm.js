import { darken } from 'polished';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import pure from 'recompose/pure';
import styled from 'styled-components';
import IngredientFormContext from '../../lib/contexts/ingredientFormContext';

import Button from '../form/Button';
import Name from './form/components/Name';
import Plural from './form/components/Plural';

const FormStyles = styled.form`
	flex-basis: 100%;
	display: flex;
	flex-direction: column;
	justify-content: flex-start;

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

	@media (min-width: ${ (props) => props.theme.desktopCardWidth }) {
		fieldset {
			margin-bottom: 6px;
		}
	}

	/* add new ingredient form styles */
	&.add {
		.save {
			position: relative;
			bottom: 20px;
			margin-top: 20px;
		}
	}
`;

const TopFormStyles = styled.div`
	fieldset.plural {
		height: 20px;
	}

	@media (min-width: ${ (props) => props.theme.desktopCardWidth }) {
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

		.isComposedIngredient, .properties {
			text-align: right;
		}
	}
`;

const MiddleFormStyles = styled.div`
	@media (min-width: ${ (props) => props.theme.desktopCardWidth }) {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20px;

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
`;

const BottomFormStyles = styled.div`
	margin-top: auto; /* stick to the bottom of the card */
	padding-top: 10px;

	.warnings {
		flex-basis: 100%;
		text-align: right;
		font-size: .875em;
		color: ${ (props) => props.theme.red };
		list-style-type: none;
		margin: 0;
		padding: 0;
	}

	.right {
		margin-top: auto;
	}

	button.cancel {
		color: #ccc;
		font-weight: 400;
		margin-right: 10px;
	}

	button.save {
		background: ${ (props) => props.theme.altGreen };
		color: white;
		border-radius: 5px;
		padding: 4px 10px;

		&:hover {
			background: ${ (props) => darken(0.1, props.theme.altGreen) };
		}
	}

	button.merge {
		color: ${ (props) => props.theme.highlight };
	}

	button.parent {
		color: ${ (props) => props.theme.orange };
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

	@media (min-width: ${ (props) => props.theme.desktopCardWidth }) {
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

		.save {
			margin-left: 20px;
		}
	}
`;

const Warning = styled.div`
	color: tomato;
	position: absolute;
	right: 0;
	margin-top: 4px;
	font-size: .8em;
`;

const IngredientForm = ({ className }) => {
	const { isEditMode, onCancelClick, onChange, onSubmit, state } = useContext(IngredientFormContext);
	const { ingredient, validationWarnings } = state;

	const errors = validationWarnings.get('errors').toJS() || {};
	const warnings = validationWarnings.get('warnings').toJS() || {};
	const allWarnings = [ ...Object.values(errors) ].concat([ ...Object.values(warnings) ]);

	console.log('form', { allWarnings });

	const name = (ingredient && ingredient.get('name')) || '';
	const plural = (ingredient && ingredient.get('plural')) || '';

	return (
		<FormStyles className={ className } onSubmit={ onSubmit }>
			{/* Top Form Elements (Name, Plural, Properties, IsComposedIngredient) */}
			<TopFormStyles>
				<div className="left">
					<Name
						onChange={ onChange }
						value={ name }
					/>

					<Plural
						// pass a className for the fieldSet height adjustment
						className="plural"
						isSuggestEnabled
						onChange={ onChange }
						value={ plural }
					/>
				</div>
				<div className="right">
					{ /* TODO properties, isComposedIngredient */ }
				</div>
			</TopFormStyles>

			<MiddleFormStyles>
				{/* TODO alternateNames, relatedIngredients, substitutes, references */}
			</MiddleFormStyles>

			{/* Bottom Form Elements (Warnings, Cancel, Save) */}
			{
				(isEditMode)
					? (
						<BottomFormStyles>
							{/* Warnings */}
							{
								allWarnings && allWarnings.map((err, i) => (
									// eslint-disable-next-line react/no-array-index-key
									<Warning key={ `${ err }_${ i }` }>{ err }</Warning>
								))
							}

							{/* Cancel Button */}
							<Button
								className="cancel"
								label="Cancel"
								onClick={ onCancelClick }
								type="button"
							/>

							{/* Save Button */}
							<Button
								className="save"
								label="Save"
								type="submit"
							/>
						</BottomFormStyles>
					)
					: null
			}
		</FormStyles>
	);
};

IngredientForm.whyDidYouRender = true;

IngredientForm.defaultProps = { className: '' };
IngredientForm.propTypes = { className: PropTypes.string };

export default pure(IngredientForm);
