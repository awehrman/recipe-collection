import { adopt } from 'react-adopt';
// import levenshtein from 'fast-levenshtein';
import gql from 'graphql-tag';
import { Component } from 'react';
import { Query, Mutation } from 'react-apollo';
import pluralize from 'pluralize';
import { darken } from 'polished';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/pro-regular-svg-icons';
// import { faCodeMerge } from '@fortawesome/pro-light-svg-icons';
// import { faExclamation } from '@fortawesome/pro-solid-svg-icons';

// eslint-disable-next-line no-unused-vars
import { deepCopy, hasProperty } from '../../lib/util';
import Button from '../form/Button';
import CheckboxGroup from '../form/CheckboxGroup';
import ErrorMessage from '../ErrorMessage';
import Input from '../form/Input';
import List from '../form/List';

const ADD_WARNING_MUTATION = gql`
	mutation addWarning(
		$fieldName: String!
	  $preventSave: Boolean!
	  $message: String!
	  $value: String!
	) {
		addWarning(
			fieldName: $fieldName,
			preventSave: $preventSave
			message: $message
			value: $value
		) @client
	}
`;

const RESET_WARNINGS_MUTATION = gql`
	mutation addWarning($reset: Boolean!) {
		resetWarnings(reset: $reset) @client
	}
`;

const GET_ALL_WARNINGS_QUERY = gql`
	query GET_ALL_WARNINGS_QUERY {
		warnings @client {
			fieldName
			preventSave
			message
			value
		}
	}
`;

const Composed = adopt({
	// eslint-disable-next-line react/prop-types
	getWarnings: ({ render }) => (
		<Query query={ GET_ALL_WARNINGS_QUERY }>{ render }</Query>
	),
	// eslint-disable-next-line react/prop-types
	addWarning: ({ render }) => (
		<Mutation mutation={ ADD_WARNING_MUTATION }>{ render }</Mutation>
	),
	// eslint-disable-next-line react/prop-types
	resetWarnings: ({ render }) => (
		<Mutation mutation={ RESET_WARNINGS_MUTATION }>{ render }</Mutation>
	),
});

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

	// add new ingredient form styles
	&.add {
		.save {
			position: absolute;
			bottom: 20px;
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

		.isComposedIngredient, .properties {
			text-align: right;
		}
	}
`;

const Left = styled.div`
	flex: 1;
`;

const Right = styled.div`
	flex: 1;
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

class Form extends Component {
	initialState = { pending: {} };

	state = this.initialState;

	// TODO finish merging the rest of the fields
	// TODO this could be simplified further
	getPendingIngredient = () => {
		console.warn('getPendingIngredient');
		// combine pending and props
		const { pending } = this.state;
		const { alternateNames, id, name, plural, relatedIngredients, substitutes } = this.props;
		const ing = {};
		console.log({ pending, ing });

		ing.id = id;
		ing.name = pending.name || name;
		ing.plural = pending.plural || plural;
		ing.alternateNames = deepCopy(alternateNames);
		ing.relatedIngredients = deepCopy(relatedIngredients);
		ing.substitutes = deepCopy(substitutes);
		// TODO properties
		// TODO isComposedIngredient

		// add in any new alternate names
		if (hasProperty(pending, 'alternateNamesCreate')) {
			pending.alternateNamesCreate.forEach((c) => {
				if (!~ing.alternateNames.indexOf(c)) {
					ing.alternateNames.push(c);
				}
			});
		}

		// remove any deleted alternate names
		if (hasProperty(pending, 'alternateNamesDelete')) {
			pending.alternateNamesDelete.forEach((d) => {
				const index = ing.alternateNames.findIndex(item => item.name === d.name);
				if (index !== -1) { ing.alternateNames.splice(index, 1); }
			});
		}

		// connect any new related ingredients
		if (hasProperty(pending, 'relatedIngredientsConnect')) {
			pending.relatedIngredientsConnect.forEach((c) => {
				if (!~ing.relatedIngredients.indexOf(c)) {
					ing.relatedIngredients.push(c);
				}
			});
		}

		// disconnect any disconnected related ingredients
		if (hasProperty(pending, 'relatedIngredientsDisconnect')) {
			pending.relatedIngredientsDisconnect.forEach((d) => {
				const index = ing.relatedIngredients.findIndex(item => item.name === d.name);
				if (index !== -1) { ing.relatedIngredients.splice(index, 1); }
			});
		}

		// connect any new substitutes
		if (hasProperty(pending, 'substitutesConnect')) {
			pending.substitutesConnect.forEach((c) => {
				if (!~ing.substitutes.indexOf(c)) {
					ing.substitutes.push(c);
				}
			});
		}

		// disconnect any disconnected substitutes
		if (hasProperty(pending, 'substitutesDisconnect')) {
			pending.substitutesDisconnect.forEach((d) => {
				const index = ing.substitutes.findIndex(item => item.name === d.name);
				if (index !== -1) { ing.substitutes.splice(index, 1); }
			});
		}


		// TODO merge property updates
		// TODO take any isComposedIngredient updates


		return ing;
	}

	getWarning = (fieldName, warnings) => {
		let fieldNameWarnings = null;

		if (warnings && warnings.length > 0) {
			const warn = [ ...warnings ];
			fieldNameWarnings = warn.filter(w => w.fieldName === fieldName);
			fieldNameWarnings = (fieldNameWarnings.length > 0) ? fieldNameWarnings : null;
		}

		return fieldNameWarnings;
	}

	onCheckboxChange = (e, fieldName, defaultValue) => {
		const { pending } = this.state;
		let properties = deepCopy(defaultValue);
		let isComposedIngredient = (hasProperty(defaultValue, 'isComposedIngredient')) ? defaultValue.isComposedIngredient : false;
		let isValidated = (hasProperty(defaultValue, 'isValidated')) ? defaultValue.isValidated : false;

		switch (fieldName) {
		case 'properties':
			properties = (hasProperty(pending, 'properties')) ? deepCopy(pending.properties) : properties;

			Object.entries(properties).forEach(([ key, value ]) => {
				if (key === e.target.value) {
					properties[key] = !value;
				}
			});

			this.setState({
				pending: {
					...pending,
					...{ properties },
				},
			});
			break;

		case 'isComposedIngredient':
			isComposedIngredient = (hasProperty(pending, 'isComposedIngredient')) ? pending.isComposedIngredient : isComposedIngredient;

			this.setState({
				pending: {
					...pending,
					...{ isComposedIngredient: !isComposedIngredient },
				},
			});
			break;

		case 'isValidated':
			isValidated = (hasProperty(pending, 'isValidated')) ? pending.isValidated : isValidated;

			this.setState({
				pending: {
					...pending,
					...{ isValidated: !isValidated },
				},
			});
			break;

		default:
			break;
		}
	}

	onCheckboxKeyDown = (e, fieldName, defaultValue) => {
		// prevent form submission when checking checkboxes with the return key
		if (e.key === 'Enter') {
			e.preventDefault();
			this.onCheckboxChange(e, fieldName, defaultValue);
		}
	}

	onInputChange = (e, addWarning, resetWarnings) => {
		const { name, value } = e.target;
		const { pending } = this.state; // TODO verify that i'm not mangling state

		this.validate(value, name, addWarning, resetWarnings);

		this.setState({
			pending: {
				...pending,
				...{ [name]: value },
			},
		});
	}

	onListChange = (listItem, fieldName, removeListItem = false, addWarning, resetWarnings) => {
		let mutationMethod; // 'connect', 'disconnect', delete', 'create'
		const { pending } = this.state; // TODO verify that i'm not mangling state
		this.validate(listItem.name, fieldName, addWarning, resetWarnings);

		if (!removeListItem) {
			mutationMethod = (fieldName === 'alternateNames')
				? `${ fieldName }Create`
				: `${ fieldName }Connect`;
		} else {
			mutationMethod = (fieldName === 'alternateNames')
				? `${ fieldName }Delete`
				: `${ fieldName }Disconnect`;
		}

		let pendingMutationMethod;
		if (hasProperty(pending, mutationMethod)) {
			pendingMutationMethod = [ ...pending[mutationMethod] ];
			pendingMutationMethod.push(listItem);
		} else {
			pendingMutationMethod = [ listItem ];
		}

		this.setState({
			pending: {
				...pending,
				...{ [mutationMethod]: pendingMutationMethod },
			},
		});
	}

	onSaveIngredient = (e) => {
		const { onSaveIngredient } = this.props;
		const { pending } = this.state;

		// TODO any common validation?

		onSaveIngredient(e, pending);
	}

	onSuggestPlural = (e, pluralBasis, addWarning, resetWarnings) => {
		e.preventDefault();
		const { pending } = this.state;

		const name = (hasProperty(pending, 'name')) ? pending.name : pluralBasis;
		let plural = null;
		try {
			plural = pluralize(name);
		} catch {
			// do nothing if this fails
		}

		if (plural) {
			this.validate(plural, 'plural', addWarning, resetWarnings);

			this.setState({
				pending: {
					...pending,
					...{ plural },
				},
			});
		}
	}

	// TODO consider moving the warnings into the local Apollo cache
	// and letting our state contain just the updates that need to happen
	validate = async (value, fieldName, addWarning, resetWarnings) => {
		console.warn('[Form] validate');
		await resetWarnings();
		// combine our latest pending updates with the ingredient info from the server
		const ing = this.getPendingIngredient();
		// eslint-disable-next-line
		console.log({ value, fieldName });

		// skip this whole thing if we don't have a value
		if (!value) return false;

		// determine which other fields we need to look in to see if this value already exists
		// exclude the current field that we're updating
		// so if you're changing 'name' field of 'buttr' to 'butter'. we need to check plural and altnames
		// for instances of 'butter'
		const validationFields = [ 'name', 'plural', 'alternateNames' ].filter(f => f !== fieldName);

		// first, check the local fields on this ingredient to see if this new value is used
		// ex: plural and alternateNames for our 'butter' example
		// if we find any matches locally, add them to the warnings array
		// we'll flag any local errors as ones that prevent the ingredient from saving until resolved
		validationFields.forEach(async (f) => {
			// if we find any matches on the name or plural fields, add a warning
			if (ing[f] && (typeof ing[f] === 'string') && (ing[f].toLowerCase() === value.toLowerCase())) {
				await addWarning({
					variables: {
						__typename: 'Warning',
						fieldName: f,
						preventSave: true,
						message: `"${ value }" is already in use on the "${ f }" field.`,
						value,
					},
				});

				await addWarning({
					variables: {
						__typename: 'Warning',
						fieldName,
						preventSave: true,
						message: `"${ value }" is already in use on the "${ f }" field.`,
						value,
					},
				});
			}

			// if we find any matches within the alternateNames, add a warning
			if (ing[f] && (typeof ing[f] === 'object') && (!ing[f].findIndex(n => n.name.toLowerCase() === value.toLowerCase()))) {
				await addWarning({
					variables: {
						__typename: 'Warning',
						fieldName,
						preventSave: true,
						message: `"${ value }" is already listed in the "${ f }" field.`,
						value,
					},
				});
			}
		});

		// TODO next, check if this value is used on another ingredient
		// if we find any matches, we'll show a warning that this update will trigger an merge between these two ingredients

		return true;
	}

	render() {
		console.warn('[Form] render');

		const {
			alternateNames, className, id, isComposedIngredient, isEditMode, loading, name, onCancelClick,
			onEditClick, plural, properties, relatedIngredients, saveLabel, showCancelButton, substitutes,
		} = this.props;
		const { pending } = this.state;

		// cleanup properties data
		const checkboxes = (isEditMode && hasProperty(pending, 'properties')) ? pending.properties : properties;
		if (hasProperty(checkboxes, '__typename')) {
			// eslint-disable-next-line no-underscore-dangle
			delete checkboxes.__typename;
		}

		// cleanup alternateNames data
		const pendingIngredient = this.getPendingIngredient();

		return (
			<Composed>
				{
					({ getWarnings, addWarning, resetWarnings }) => {
						const { data, error } = getWarnings || {};
						const { warnings } = data || [];

						if (error) return <ErrorMessage error={ error } />;

						return (
							<FormStyles className={ className }>
								<TopFormStyles>
									<Left>
										{/* Name */}
										<Input
											addWarning={ addWarning }
											className="name"
											defaultValue={ name }
											fieldName="name"
											isEditMode={ isEditMode }
											isRequiredField
											loading={ loading }
											onChange={ this.onInputChange }
											placeholder="name"
											resetWarnings={ resetWarnings }
											suppressLocalWarnings
											value={ pending.name }
											warnings={ this.getWarning('name', warnings) || undefined }
										/>

										{/* Plural */}
										<Input
											addWarning={ addWarning }
											className={ (isEditMode) ? 'plural' : 'plural hidden' }
											defaultValue={ plural }
											fieldName="plural"
											isEditMode={ isEditMode }
											isPluralSuggestEnabled
											loading={ loading }
											onChange={ this.onInputChange }
											onSuggestPlural={ e => this.onSuggestPlural(e, name) }
											placeholder="plural"
											pluralBasis={ name }
											resetWarnings={ resetWarnings }
											suppressLocalWarnings
											value={ pending.plural }
											warnings={ this.getWarning('plural', warnings) || undefined }
										/>
									</Left>

									<Right>
										{/* Properties */}
										<CheckboxGroup
											className="properties"
											fieldName="properties"
											isEditMode={ isEditMode }
											loading={ loading }
											key={ `card_properties_${ id }` }
											keys={ [ ...Object.keys(checkboxes) ] }
											onChange={ e => this.onCheckboxChange(e, 'properties', properties) }
											onKeyDown={ e => this.onCheckboxKeyDown(e, 'properties', properties) }
											values={ [ ...Object.values(checkboxes) ] }
										/>

										{/* Is Composed Ingredient */}
										<CheckboxGroup
											className="isComposedIngredient"
											fieldName="isComposedIngredient"
											isEditMode={ isEditMode }
											loading={ loading }
											key={ `card_isComposed_${ id }` }
											keys={ [ 'Is Composed Ingredient?' ] }
											onChange={ e => this.onCheckboxChange(e, 'isComposedIngredient', isComposedIngredient) }
											onKeyDown={ e => this.onCheckboxKeyDown(e, 'isComposedIngredient', isComposedIngredient) }
											values={ [ (isEditMode && hasProperty(pending, 'isComposedIngredient'))
												? pending.isComposedIngredient : isComposedIngredient ] }
										/>
									</Right>
								</TopFormStyles>

								<MiddleFormStyles>
									<Left>
										{/* Alternate Names */}
										<List
											addWarning={ addWarning }
											className="alternateNames"
											defaultValues={ alternateNames }
											fieldName="alternateNames"
											isEditMode={ isEditMode }
											isPluralSuggestEnabled
											isRemoveable
											label="Alternate Names"
											loading={ loading }
											onListChange={ this.onListChange }
											onSuggestPlural={ this.onSuggestPlural }
											placeholder="alternate name"
											resetWarnings={ resetWarnings }
											suppressLocalWarnings
											warnings={ this.getWarning('alternateNames', warnings) || undefined }
											values={ pendingIngredient.alternateNames }
											validate={ this.validate }
										/>

										{/* Related Ingredients */}
										<List
											className="relatedIngredients"
											defaultValues={ relatedIngredients }
											fieldName="relatedIngredients"
											isEditMode={ isEditMode }
											isRemoveable
											label="Related Ingredients"
											loading={ loading }
											onListChange={ this.onListChange }
											placeholder="related ingredient"
											suppressLocalWarnings
											values={ pendingIngredient.relatedIngredients }
											validate={ this.validate }
										/>

										{/* Substitutes */}
										<List
											className="substitutes"
											defaultValues={ substitutes }
											fieldName="substitutes"
											isEditMode={ isEditMode }
											isRemoveable
											label="Substitutes"
											loading={ loading }
											onListChange={ this.onListChange }
											placeholder="substitutes"
											suppressLocalWarnings
											values={ pendingIngredient.substitutes }
											validate={ this.validate }
										/>
									</Left>

									<Right />
								</MiddleFormStyles>

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
			</Composed>
		);
	}
}

Form.defaultProps = {
	alternateNames: [],
	className: '',
	id: '-1',
	isComposedIngredient: false,
	isEditMode: true,
	loading: false,
	name: null,
	onCancelClick: () => {
		console.log('*** [Form] psst! You didn\'t pass an onCancelClick function!');
		return null;
	},
	onEditClick: () => {
		console.log('*** [Form] psst! You didn\'t pass an onEditClick function!');
		return null;
	},
	onSaveIngredient: () => {
		console.log('*** [Form] psst! You didn\'t pass an onSaveIngredient function!');
		return null;
	},
	plural: null,
	properties: {
		dairy: false,
		fish: false,
		gluten: false,
		meat: false,
		poultry: false,
		soy: false,
		__typename: 'Property',
	},
	relatedIngredients: [],
	saveLabel: 'Save',
	showCancelButton: false,
	substitutes: [],
};

Form.propTypes = {
	alternateNames: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string.isRequired })),
	className: PropTypes.string,
	id: PropTypes.string,
	isComposedIngredient: PropTypes.bool,
	isEditMode: PropTypes.bool,
	loading: PropTypes.bool,
	name: PropTypes.string,
	onCancelClick: PropTypes.func,
	onEditClick: PropTypes.func,
	onSaveIngredient: PropTypes.func,
	plural: PropTypes.string,
	// TODO improve prop types
	properties: PropTypes.shape({
		dairy: PropTypes.bool.isRequired,
		fish: PropTypes.bool.isRequired,
		gluten: PropTypes.bool.isRequired,
		meat: PropTypes.bool.isRequired,
		poultry: PropTypes.bool.isRequired,
		soy: PropTypes.bool.isRequired,
	}),
	relatedIngredients: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string, /* if the id is left blank, its a new ingredient */
		name: PropTypes.string.isRequired,
	})),
	saveLabel: PropTypes.string,
	showCancelButton: PropTypes.bool,
	substitutes: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string, /* if the id is left blank, its a new ingredient */
		name: PropTypes.string.isRequired,
	})),
};

export default Form;
export {
	ADD_WARNING_MUTATION,
	GET_ALL_WARNINGS_QUERY,
	RESET_WARNINGS_MUTATION,
};
