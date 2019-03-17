import { darken } from 'polished';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
// import levenshtein from 'fast-levenshtein';
// import pluralize from 'pluralize';

import faEdit from '@fortawesome/fontawesome-pro-regular/faEdit';
// import faCodeMerge from '@fortawesome/fontawesome-pro-light/faCodeMerge';
// import faExclamation from '@fortawesome/fontawesome-pro-solid/faExclamation';
// import faPlus from '@fortawesome/fontawesome-pro-regular/faPlus';

// eslint-disable-next-line no-unused-vars
import { deepCopy, hasProperty } from '../../lib/util';
import Button from '../form/Button';
// import CheckboxGroup from '../form/CheckboxGroup';
// import ErrorMessage from '../ErrorMessage';
import Input from '../form/Input';
// import List from '../form/List';

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

	@media (min-width: ${ props => props.theme.desktopCardWidth }) {
		fieldset {
			margin-bottom: 6px;
		}
	}
`;

const TopFormStyles = styled.div`
	fieldset.plural {
		height: 20px;
	}

	@media (min-width: ${ props => props.theme.desktopCardWidth }) {
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
`;

const MiddleFormStyles = styled.div`
	@media (min-width: ${ props => props.theme.desktopCardWidth }) {
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
`;

const BottomFormStyles = styled.div`
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

class IngredientForm extends React.PureComponent {
	initialState = {
		pending: {},
		warnings: [],
	};

	state = this.initialState;

	getPendingIngredient = () => {
		// combine pending and props
		const { pending } = this.state;
		const { alternateNames, id, name, plural } = this.props;
		const ing = {};

		ing.id = id;
		ing.name = pending.name || name;
		ing.plural = pending.plural || plural;
		ing.alternateNames = deepCopy(alternateNames);

		// add in any new additions
		if (hasProperty(pending, 'alternateNamesCreate')) {
			pending.alternateNamesCreate.forEach((c) => {
				if (!~ing.alternateNames.indexOf(c)) {
					ing.alternateNames.push(c);
				}
			});
		}

		// remove any recently removed names
		if (hasProperty(pending, 'alternateNamesDelete')) {
			pending.alternateNamesDelete.forEach((d) => {
				const index = ing.alternateNames.findIndex(item => item.name === d.name);
				if (index !== -1) { ing.alternateNames.splice(index, 1); }
			});
		}

		// TODO add in related, substitutes, properties, references, isValidated, isComposedIngredient

		// eslint-disable-next-line
		console.log({ ing, pending });

		return ing;
	}

	onInputChange = (e) => {
		console.warn('[IngredientForm] onInputChange');
		const { name, value } = e.target;
		const { pending } = this.state; // TODO verify that i'm not mangling state
		const warnings = this.validate(value, name);

		this.setState({
			pending: {
				...pending,
				...{ [name]: value },
			},
			warnings,
		});
	}

	onSaveIngredient = (e) => {
		console.warn('[IngredientForm] onSaveIngredient');
		const { onSaveIngredient } = this.props;
		const { pending } = this.state;

		console.log(pending);
		// TODO any common validation?

		onSaveIngredient(e, pending);
	}

	validate = (value, fieldName) => {
		console.warn('[IngredientForm] validate');
		// combine our latest pending updates with the ingredient info from the server
		const ing = this.getPendingIngredient();
		const warnings = {};
		// eslint-disable-next-line
		console.log({ value, fieldName });

		// skip this whole thing if we don't have a value
		if (!value) return warnings;

		// determine which other fields we need to look in to see if this value already exists
		// exclude the current field that we're updating
		// so if you're changing 'name' field of 'buttr' to 'butter'. we need to check plural and altnames
		// for instances of 'butter'
		const validationFields = [ 'name', 'plural', 'alternateNames' ].filter(f => f !== fieldName);

		// first, check the local fields on this ingredient to see if this new value is used
		// ex: plural and alternateNames for our 'butter' example
		// if we find any matches locally, add them to the warnings array
		// we'll flag any local errors as ones that prevent the ingredient from saving until resolved
		validationFields.forEach((f) => {
			// if we find any matches on the name or plural fields, add a warning
			if ((typeof ing[f] === 'string') && (ing[f].toLowerCase() === value.toLowerCase())) {
				warnings[f] = {
					preventSave: true,
					warning: `"${ value }" is already in use on the "${ f }" field.`,
				};
			}

			// if we find any matches within the alternateNames, add a warning
			if ((typeof ing[f] === 'object') && (!ing[f].findIndex(n => n.name.toLowerCase() === value.toLowerCase()))) {
				warnings[f] = {
					preventSave: true,
					warning: `"${ value }" is already listed in the "${ f }" field.`,
				};
			}
		});

		// next, check if this value is used on another ingredient
		// if we find any matches, we'll show a warning that this update will trigger an merge between these two ingredients
		console.warn(warnings);

		return warnings;
	}

	render() {
		console.warn('[IngredientForm] render');
		const {
			id, isEditMode, loading, name,
			onCancelClick, onEditClick, saveLabel, showCancelButton,
		} = this.props;
		const { pending, warnings } = this.state;
		// eslint-disable-next-line object-curly-newline
		console.log({ pending, loading });

		return (
			<FormStyles>
				<TopFormStyles>
					{/* Name */}
					<Input
						className="name"
						defaultValue={ name }
						fieldName="name"
						isEditMode={ isEditMode }
						isRequiredField
						loading={ loading }
						onChange={ this.onInputChange }
						placeholder="name"
						suppressInlineWarnings
						value={ pending.name }
						warning={ warnings.name || null }
					/>
				</TopFormStyles>

				<MiddleFormStyles />

				<BottomFormStyles>
					{/* Cancel Button */
						(isEditMode && showCancelButton)
							? (
								<Button
									className="cancel"
									label="Cancel"
									onClick={ e => onCancelClick(e) }
								/>
							) : null
					}

					{/* Edit / Save Button */
						(!isEditMode)
							? (
								<Button
									className="edit"
									icon={ <FontAwesomeIcon icon={ faEdit } /> }
									label="Edit"
									onClick={ e => onEditClick(e) }
								/>
							) : (
								<Button
									className="save"
									label={ saveLabel }
									onClick={ e => this.onSaveIngredient(e) }
								/>
							)
					}
				</BottomFormStyles>
			</FormStyles>
		);
	}
}

IngredientForm.defaultProps = {
	alternateNames: [],
	id: '-1',
	isEditMode: true,
	loading: false,
	name: null,
	onCancelClick: e => e.preventDefault(),
	onEditClick: e => e.preventDefault(),
	onSaveIngredient: e => e.preventDefault(),
	plural: null,
	saveLabel: 'Save',
	showCancelButton: false,
};

IngredientForm.propTypes = {
	alternateNames: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string.isRequired })),
	id: PropTypes.string,
	isEditMode: PropTypes.bool,
	loading: PropTypes.bool,
	name: PropTypes.string,
	onCancelClick: PropTypes.func,
	onEditClick: PropTypes.func,
	onSaveIngredient: PropTypes.func,
	plural: PropTypes.string,
	saveLabel: PropTypes.string,
	showCancelButton: PropTypes.bool,
};

export default IngredientForm;
