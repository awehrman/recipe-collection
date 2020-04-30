import { useMutation, useQuery } from '@apollo/client';
import { darken } from 'polished';
import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import pure from 'recompose/pure';
import styled from 'styled-components';

import Button from '../common/Button';
import Name from './form/components/Name';
import Plural from './form/components/Plural';
import Properties from './form/components/Properties';
import IsComposedIngredient from './form/components/IsComposedIngredient';
import useIngredientForm from './form/useIngredientForm';
import ContainerContext from '../../lib/contexts/ingredients/containerContext';
import CardContext from '../../lib/contexts/ingredients/cardContext';
import ViewContext from '../../lib/contexts/ingredients/viewContext';
import { GET_INGREDIENT_QUERY, GET_INGREDIENTS_COUNT_QUERY } from '../../lib/apollo/queries/ingredients';
import { UPDATE_INGREDIENT_MUTATION } from '../../lib/apollo/mutations/ingredients';
import { CREATE_CONTAINERS_MUTATION } from '../../lib/apollo/mutations/containers';

const Form = ({ className, id }) => {
	// console.log('[Form]');
	const [ isSubmitting, setIsSubmitting ] = useState(false); // TODO should this be in context, or does that still cause re-renders?

	const ctx = useContext(CardContext);
	const isEditMode = ctx.get('isEditMode');
	const enableEditMode = ctx.get('enableEditMode');
	const disableEditMode = ctx.get('disableEditMode');

	const viewContext = useContext(ViewContext);
	const group = viewContext.get('group');
	const view = viewContext.get('view');

	const containerContext = useContext(ContainerContext);
	const nextIngredientID = containerContext.get('nextIngredientID');

	// setup form utilities and validation
	const {
		clearValidation,
		handleFormLoad,
		handleIngredientChange,
		handleIngredientSave,
		restoreForm,
		validation: {
			errors,
			warnings,
		},
		validationMessages,
		values,
	} = useIngredientForm({ id });

	const { ingredient } = values;
	const name = ingredient.get('name') || '';
	const plural = ingredient.get('plural') || '';
	const isComposedIngredient = Boolean(ingredient.get('isComposedIngredient'));
	const properties = ingredient.get('properties');
	const alternateNames = ingredient.get('alternateNames');
	const relatedIngredients = ingredient.get('relatedIngredients');
	const substitutes = ingredient.get('substitutes');
	const references = ingredient.get('references');

	// setup save mutation
	const [ createContainers ] = useMutation(CREATE_CONTAINERS_MUTATION);
	const [ saveIngredient ] = useMutation(UPDATE_INGREDIENT_MUTATION, {
		refetchQueries: [
			{ query: GET_INGREDIENTS_COUNT_QUERY },
		],
		update(cache, { data: { updateIngredient } }) {
			setIsSubmitting(false);

			if (!updateIngredient.errors.length) {
				createContainers({
					variables: {
						currentIngredientID: (view === 'new') ? nextIngredientID : null, // TODO this should be the next ingredient in the list
						group,
						view,
					},
				});
			}
			// TODO progress card to the next ingredient item in the container
		},
	});

	let loading = Boolean(id);

	// if we have an id, query this ingredient from the server
	if (id) {
		({ loading } = useQuery(GET_INGREDIENT_QUERY, {
			onCompleted: handleFormLoad,
			variables: { id },
		}));
	}

	// reset edit mode on ingredient switch
	useEffect(() => {
		clearValidation();
		if (view !== 'new') {
			disableEditMode();
		} else {
			enableEditMode();
		}
	}, [ id ]);

	function onCancelClick(e) {
		e.preventDefault();
		clearValidation();
		disableEditMode();
		restoreForm();
	}

	function onSubmit(e) {
		console.log('onSubmit');
		e.preventDefault();
		setIsSubmitting(true);
		handleIngredientSave(saveIngredient);
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

		if (isEditMode) {
			fieldClassName += ' editable';
		}

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
						className={ classNames.name }
						loading={ loading }
						onChange={ handleIngredientChange }
						value={ name }
					/>
					<Plural
						className={ classNames.plural }
						isPluralSuggestEnabled
						loading={ loading }
						onChange={ handleIngredientChange }
						singular={ name }
						value={ plural }
					/>
				</div>
				<div className="right">
					<Properties
						loading={ loading }
						onChange={ handleIngredientChange }
						values={ properties }
					/>
					<IsComposedIngredient
						onChange={ handleIngredientChange }
						value={ isComposedIngredient }
					/>
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
							{/* Warnings */}
							<Warnings>
								{
									validationMessages.map((err, i) => (
										// eslint-disable-next-line react/no-array-index-key
										<Warning key={ `${ err }_${ i }` }>{ err }</Warning>
									))
								}
							</Warnings>

							<Controls>
								{/* Cancel Button */}
								<Button
									className="cancel"
									disable={ isSubmitting }
									label="Cancel"
									onClick={ onCancelClick }
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

Form.whyDidYouRender = true;

Form.defaultProps = {
	className: '',
	id: null,
};

Form.propTypes = {
	className: PropTypes.string,
	id: PropTypes.string,
};

export default pure(Form);

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
