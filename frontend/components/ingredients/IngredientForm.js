import { useQuery } from '@apollo/client';
import { darken } from 'polished';
import PropTypes from 'prop-types';
import React, { useContext, useState } from 'react';
import pure from 'recompose/pure';
import styled from 'styled-components';

import Button from '../form/Button';
import Name from './form/components/Name';
// import Plural from './form/components/Plural';
import useIngredientForm from './form/useIngredientForm';
import useValidation from './form/useValidation';
import CardContext from '../../lib/contexts/ingredients/cardContext';
import { GET_INGREDIENT_QUERY } from '../../lib/apollo/queries/ingredients';

const IngredientForm = ({ className, id }) => {
	// console.log('[IngredientForm]');
	const [ isSubmitting, setIsSubmitting ] = useState(false);

	const ctx = useContext(CardContext);
	const isEditMode = ctx.get('isEditMode');
	const disableEditMode = ctx.get('disableEditMode');

	let error = null;
	let loading = Boolean(id);

	const {
		handleFormLoad,
		handleIngredientChange,
		handleIngredientSave,
		handleQueryError,
		values,
	} = useIngredientForm({ id });

	// enable form validation
	const { validation } = useValidation({ values });
	const { errors, warnings } = validation;

	const { ingredient } = values;

	const name = ingredient.get('name') || '';
	const plural = ingredient.get('plural');
	const isComposedIngredient = ingredient.get('isComposedIngredient');
	const properties = ingredient.get('properties');
	const alternateNames = ingredient.get('alternateNames');
	const relatedIngredients = ingredient.get('relatedIngredients');
	const substitutes = ingredient.get('substitutes');
	const references = ingredient.get('references');

	// TODO setup save mutation; on update setIsSubmitting(false)

	// if we have an id, query this ingredient from the server
	if (id) {
		({
			error,
			loading,
		} = useQuery(GET_INGREDIENT_QUERY, {
			onCompleted: handleFormLoad,
			variables: { id },
		}));
		if (error) handleQueryError(error);
	}

	function onSubmit(e) {
		console.log('onSubmit');
		e.preventDefault();
		setIsSubmitting(true);
		handleIngredientSave();
	}

	const classNameFields = [
		'name',
		'plural',
		'alternateNames',
	];

	// TODO maybe move this into a util func
	const classNames = classNameFields.reduce((acc, field) => {
		const fieldValue = ingredient.get(field);

		let fieldClassName = (isEditMode && (field !== 'alternateNames') && fieldValue && fieldValue.length)
			? 'enabled'
			: '';

			if (errors.get(field) || warnings.get(field)) {
				fieldClassName += ' warning';
			}

		return {
			...acc,
			[field]: fieldClassName,
		};
	}, {});

	return (
		<FormStyles className={ className } id="ingForm" onSubmit={ onSubmit }>
			{/* Top Form Elements (Name, Plural, Properties, IsComposedIngredient) */}
			<TopFormStyles>
				<div className="left">
					<Name
						className={ classNames.name || '' }
						loading={ loading }
						onChange={ handleIngredientChange }
						value={ name || '' }
					/>
					{ plural }
				</div>
				<div className="right">
					{ `${ properties }` }
					{ isComposedIngredient }
				</div>
			</TopFormStyles>

			<MiddleFormStyles>
				{ `${ alternateNames }` }
				{ `${ relatedIngredients }` }
				{ `${ substitutes }` }
				{ `${ references }` }
			</MiddleFormStyles>

			{/* Bottom Form Elements (Warnings, Cancel, Save) */}
			{
				(isEditMode)
					? (
						<BottomFormStyles>
							{/* Warnings
							<Warnings>
								{
									allWarnings && allWarnings.map((err, i) => (
										// eslint-disable-next-line react/no-array-index-key
										<Warning key={ `${ err }_${ i }` }>{ err }</Warning>
									))
								}
							</Warnings>
							 */}

							<Controls>
								{/* Cancel Button */}
								<Button
									className="cancel"
									disable={ isSubmitting }
									label="Cancel"
									onClick={ disableEditMode }
									type="button"
								/>

								{/* Save Button */}
								<Button
									className="save"
									formName="ingForm"
									label="Save"
									type="submit"
								/>
							</Controls>
						</BottomFormStyles>
					)
					: null
			}
		</FormStyles>
	);
};

IngredientForm.whyDidYouRender = true;

IngredientForm.defaultProps = {
	className: '',
	id: null,
};

IngredientForm.propTypes = {
	className: PropTypes.string,
	id: PropTypes.string,
};

export default pure(IngredientForm);

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
	flex-direction: column;

	.right {
		margin-top: auto;
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
	}
`;
/*
const Warning = styled.li`
	color: tomato;
	margin-top: 4px;
	font-size: .8em;
	flex: 1;
`;

const Warnings = styled.ul`
	text-align: right;
	font-size: .875em;
	color: ${ (props) => props.theme.red };
	list-style-type: none;
	margin-bottom: 10px;;
	padding: 0;
`;
*/

const Controls = styled.div`
	/* float: right; */
	align-self: flex-end;

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
`;
