import { withApollo } from 'react-apollo';
// import levenshtein from 'fast-levenshtein';
import { Component } from 'react';
import pluralize from 'pluralize';
import { darken } from 'polished';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import uuid from 'uuid';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/pro-regular-svg-icons';
// import { faCodeMerge } from '@fortawesome/pro-light-svg-icons';
// import { faExclamation } from '@fortawesome/pro-solid-svg-icons';

import { deepCopy, hasProperty } from '../../lib/util';
import Button from '../form/Button';
import CheckboxGroup from '../form/CheckboxGroup';
import Input from '../form/Input';
import List from '../form/List';
import { GET_INGREDIENT_BY_VALUE_QUERY } from '../../lib/apollo/queries';

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

	.warnings {
		flex-basis: 100%;
		text-align: right;
		font-size: .875em;
		color: ${ props => props.theme.red };
		list-style-type: none;
		margin: 0;
		padding: 0;
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

		.save {
			margin-left: 20px;
		}
	}
`;
class Form extends Component {
	initialState = {
		pending: {},
		warnings: [],
	};

	state = this.initialState;

	componentDidUpdate() {
		const { isFormReset, resetForm } = this.props;
		if (isFormReset) {
			this.setState(this.initialState, resetForm);
		}
	}

	getPendingIngredient = () => {
		const { pending } = this.state;
		const {
			alternateNames,
			id,
			isComposedIngredient,
			isValidated,
			name,
			parentID,
			parentName,
			plural,
			properties,
			references,
			relatedIngredients,
			substitutes,
		} = this.props;

		const ing = {
			id,
			name: pending.name || name,
			plural: pending.plural || plural,
			alternateNames: deepCopy(alternateNames),
			relatedIngredients: deepCopy(relatedIngredients),
			substitutes: deepCopy(substitutes),
			properties: {
				__typename: 'Properties',
				dairy: hasProperty(pending, properties) ? pending.properties.dairy : properties.dairy,
				fish: hasProperty(pending, properties) ? pending.properties.fish : properties.fish,
				gluten: hasProperty(pending, properties) ? pending.properties.gluten : properties.gluten,
				meat: hasProperty(pending, properties) ? pending.properties.meat : properties.meat,
				poultry: hasProperty(pending, properties) ? pending.properties.poultry : properties.poultry,
				soy: hasProperty(pending, properties) ? pending.properties.soy : properties.soy,
			},
			isComposedIngredient: (hasProperty(pending, isComposedIngredient))
				? pending.isComposedIngredient : isComposedIngredient,
			isValidated,
			parentID, // TODO
			parentName, // TODO
			references, // TODO
		};

		// add in any new alternate names
		if (hasProperty(pending, 'alternateNamesCreate')) {
			pending.alternateNamesCreate.forEach((c) => {
				if (!~ing.alternateNames.indexOf(c)) {
					ing.alternateNames.push({ name: c });
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
					ing.relatedIngredients.push({ ...c });
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
					ing.substitutes.push({ ...c });
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
		// eslint-disable-next-line react/destructuring-assignment
		const pending = deepCopy(this.state.pending);
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

	onInputChange = (e) => {
		const { name, value } = e.target;
		const { pending } = this.state;

		this.setState({
			pending: {
				...deepCopy(pending),
				...{ [name]: value },
			},
		}, () => this.validate(name, value));
	}

	onListChange = (listItem, fieldName, removeListItem = false) => {
		let mutationMethod; // 'connect', 'disconnect', delete', 'create'
		const { pending } = this.state;
		let isRemoved = false;

		if (!removeListItem) {
			mutationMethod = (fieldName === 'alternateNames')
				? `${ fieldName }Create`
				: `${ fieldName }Connect`;
		} else {
			mutationMethod = (fieldName === 'alternateNames')
				? `${ fieldName }Delete`
				: `${ fieldName }Disconnect`;
			isRemoved = true;
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
				...deepCopy(pending),
				...{ [mutationMethod]: pendingMutationMethod },
			},
		}, () => this.validate(fieldName, listItem, isRemoved));
	}

	onSaveIngredient = (e) => {
		const { onSaveIngredient } = this.props;
		const { warnings } = this.state;
		const ing = this.getPendingIngredient();

		if (warnings.filter(w => w.preventSave).length === 0) {
			onSaveIngredient(e, ing);
		}
	}

	onSuggestPlural = async (e, pluralBasis) => {
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
			this.setState({
				pending: {
					...deepCopy(pending),
					...{ plural },
				},
			}, () => {
				if (plural) {
					this.validate('plural', plural);
				}
			});
		}
	}

	validate = async (fieldName, value, isRemoved = false) => {
		// console.warn(`validate ${ fieldName }, ${ value }, ${ isRemoved }`);
		let warnings = [];
		const ing = this.getPendingIngredient();

		warnings = warnings.concat(await this.validateField(fieldName, value, isRemoved));

		if ((fieldName !== 'name') && ing.name) {
			warnings = warnings.concat(await this.validateField('name', ing.name, isRemoved));
		}

		if ((fieldName !== 'plural') && ing.plural) {
			warnings = warnings.concat(await this.validateField('plural', ing.plural, isRemoved));
		}

		if ((fieldName !== 'alternateNames') && (ing.alternateNames.length > 0)) {
			const promises = ing.alternateNames.map(async w => this.validateField('alternateNames', w.name, isRemoved));
			const resolvedPromises = await Promise.all(promises);
			warnings = warnings.concat(resolvedPromises);
		}

		// filter duplicate messages
		warnings = warnings.reduce((acc, current) => {
			const x = acc.find(w => w.message === current.message);
			if (!x || current.preventSave) {
				return acc.concat([ current ]);
			}
			return acc;
		}, []);

		// get rid of any empty values
		warnings = warnings.filter(w => w.value && w.value.length > 0);

		this.setState({ warnings: warnings.flat() });
	}

	// TODO test removing fields here
	validateField = async (fieldName, value, isRemoved = false) => {
		// console.warn(`validateField ${ fieldName }, ${ value }, ${ isRemoved }`);
		const { client } = this.props;
		const warnings = [];

		// if we found this value used on another ingredient, add a warning, but allow save
		// saving will trigger a merge on these two ingredients
		const { data } = await client.query({
			query: GET_INGREDIENT_BY_VALUE_QUERY,
			variables: { value },
		});
		const { ingredient } = data;

		// if we found this value used on another ingredient, add a warning, but allow save
		// saving will trigger a merge on these two ingredients
		if (ingredient && (!~warnings.findIndex(w => w.value === value))) {
			warnings.push({
				id: uuid.v4(),
				fieldName,
				preventSave: false,
				message: `"${ value }" is already in use on the "${ ingredient.name }" ingredient.`,
				value,
			});
		}

		// TODO determine which other fields we need to look in to see if this value already exists
		// exclude the current field that we're updating
		// so if you're changing 'name' field of 'buttr' to 'butter'. we need to check plural and alt names
		// for instances of 'butter'
		const ing = this.getPendingIngredient();
		const validationFields = [ 'name', 'plural', 'alternateNames' ].filter(f => f !== fieldName);

		// first, check the local fields on this ingredient to see if this new value is used
		// ex: plural and alternateNames for our 'butter' example
		// if we find any matches locally, add them to the warnings array
		// we'll flag any local errors as ones that prevent the ingredient from saving until resolved

		validationFields.forEach(async (f) => {
			// if we find any matches on the name or plural fields, add a warning
			if (value && ing[f] && (typeof ing[f] === 'string') && (ing[f].toLowerCase() === value.toLowerCase())) {
				warnings.push({
					id: uuid.v4(),
					fieldName: f,
					preventSave: true,
					message: `"${ value }" is already in use on the "${ f }" field.`,
					value,
				});

				warnings.push({
					id: uuid.v4(),
					fieldName,
					preventSave: true,
					message: `"${ value }" is already in use on the "${ fieldName }" field.`,
					value,
				});
			}

			// if we find any matches within the alternateNames, add a warning
			if (ing[f] && (typeof ing[f] === 'object') && (!ing[f].findIndex(n => n.name.toLowerCase() === value.toLowerCase()))) {
				warnings.push({
					id: uuid.v4(),
					fieldName,
					preventSave: true,
					message: `"${ value }" is already listed in the "${ f }" field.`,
					value,
				});
			}
		});

		return warnings;
	}

	render() {
		// console.warn('[Form] render');
		const {
			alternateNames, className, id, isComposedIngredient, isEditMode, loading, name, onCancelClick,
			onEditClick, plural, properties, relatedIngredients, saveLabel, showCancelButton, substitutes,
		} = this.props;
		const { pending, warnings } = this.state;

		// cleanup properties data
		const checkboxes = (isEditMode && hasProperty(pending, 'properties')) ? pending.properties : properties;
		if (hasProperty(checkboxes, '__typename')) {
			// eslint-disable-next-line no-underscore-dangle
			delete checkboxes.__typename;
		}

		// cleanup alternateNames data
		const pendingIngredient = this.getPendingIngredient();

		return (
			<FormStyles className={ className }>
				<TopFormStyles>
					<Left>
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
							suppressLocalWarnings
							value={ pending.name }
							warnings={ this.getWarning('name', warnings) || undefined }
						/>

						{/* Plural */}
						<Input
							className="plural"
							defaultValue={ plural }
							fieldName="plural"
							isEditMode={ isEditMode }
							isPluralSuggestEnabled
							loading={ loading }
							onChange={ this.onInputChange }
							onSuggestPlural={ e => this.onSuggestPlural(e, name) }
							placeholder="plural"
							pluralBasis={ name }
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
							className="alternateNames"
							defaultValues={ alternateNames }
							fieldName="alternateNames"
							isEditMode={ isEditMode }
							isPluralSuggestEnabled
							isRemovable
							label="Alternate Names"
							loading={ loading }
							onListChange={ this.onListChange }
							onSuggestPlural={ this.onSuggestPlural }
							placeholder="alternate name"
							suppressLocalWarnings
							warnings={ this.getWarning('alternateNames', warnings) || undefined }
							validate={ this.validate }
							values={ pendingIngredient.alternateNames }
						/>

						{/* Related Ingredients */}
						<List
							className="relatedIngredients"
							defaultValues={ relatedIngredients }
							fieldName="relatedIngredients"
							isEditMode={ isEditMode }
							isRemovable
							label="Related Ingredients"
							loading={ loading }
							onListChange={ this.onListChange }
							placeholder="related ingredient"
							suppressLocalWarnings
							validate={ this.validate }
							values={ pendingIngredient.relatedIngredients }
						/>

						{/* Substitutes */}
						<List
							className="substitutes"
							defaultValues={ substitutes }
							fieldName="substitutes"
							isEditMode={ isEditMode }
							isRemovable
							label="Substitutes"
							loading={ loading }
							onListChange={ this.onListChange }
							placeholder="substitutes"
							suppressLocalWarnings
							validate={ this.validate }
							values={ pendingIngredient.substitutes }
						/>
					</Left>

					<Right />
				</MiddleFormStyles>

				<BottomFormStyles>
					{/* Warnings */
						(warnings && warnings.length > 0)
							? (
								<ul className="warnings">
									{
										warnings.map((warning, index) => (
											// eslint-disable-next-line react/no-array-index-key
											<li key={ `${ warning.id }_${ index }` }>
												{ warning.message }
											</li>
										))
									}
								</ul>
							) : null
					}
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

Form.defaultProps = {
	alternateNames: [],
	className: '',
	id: '-1',
	isComposedIngredient: false,
	isValidated: false,
	isEditMode: true,
	isFormReset: false,
	loading: false,
	name: null,
	onCancelClick: () => {},
	onEditClick: () => {},
	onSaveIngredient: () => {},
	parentID: null,
	parentName: null,
	references: [],
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
	resetForm: () => {},
	saveLabel: 'Save',
	showCancelButton: false,
	substitutes: [],
};

Form.propTypes = {
	alternateNames: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string.isRequired })),
	className: PropTypes.string,
	client: PropTypes.shape({
		readQuery: PropTypes.func,
		query: PropTypes.func,
	}).isRequired,
	id: PropTypes.string,
	isComposedIngredient: PropTypes.bool,
	isValidated: PropTypes.bool,
	isEditMode: PropTypes.bool,
	isFormReset: PropTypes.bool,
	loading: PropTypes.bool,
	name: PropTypes.string,
	onCancelClick: PropTypes.func,
	onEditClick: PropTypes.func,
	onSaveIngredient: PropTypes.func,
	parentID: PropTypes.string,
	parentName: PropTypes.string,
	plural: PropTypes.string,
	properties: PropTypes.shape({
		dairy: PropTypes.bool.isRequired,
		fish: PropTypes.bool.isRequired,
		gluten: PropTypes.bool.isRequired,
		meat: PropTypes.bool.isRequired,
		poultry: PropTypes.bool.isRequired,
		soy: PropTypes.bool.isRequired,
	}),
	references: PropTypes.arrayOf(PropTypes.shape({})),
	relatedIngredients: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string, /* if the id is left blank, its a new ingredient */
		name: PropTypes.string.isRequired,
	})),
	resetForm: PropTypes.func,
	saveLabel: PropTypes.string,
	showCancelButton: PropTypes.bool,
	substitutes: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string, /* if the id is left blank, its a new ingredient */
		name: PropTypes.string.isRequired,
	})),
};

export default withApollo(Form);
