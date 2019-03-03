import { adopt } from 'react-adopt';
import { Component } from 'react';
import { darken } from 'polished';
import { Query, Mutation } from 'react-apollo';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import gql from 'graphql-tag';
import levenshtein from 'fast-levenshtein';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import faEdit from '@fortawesome/fontawesome-pro-regular/faEdit';
import faCodeMerge from '@fortawesome/fontawesome-pro-light/faCodeMerge';
import faExclamation from '@fortawesome/fontawesome-pro-solid/faExclamation';
import faPlus from '@fortawesome/fontawesome-pro-regular/faPlus';

import Button from '../form/Button';
import CheckboxGroup from '../form/CheckboxGroup';
import Input from '../form/Input';
import List from '../form/List';
import Modal from '../form/Modal';

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

// TODO do we need all these fields in the return?
const Composed = adopt({
	getIngredient: ({ render, id }) => <Query query={ CURRENT_INGREDIENT_QUERY } variables={ { id } }>{ render }</Query>,
	updateIngredient: ({ render }) => <Mutation mutation={ UPDATE_INGREDIENT_MUTATION }>{ render }</Mutation>
});

const CardStyles = styled.div`
	max-height: ${ props => props.theme.mobileCardHeight };
	padding: 20px;
	border-bottom: 1px solid #ddd;
	width: 100%;
	display: flex;
	position: relative;

	&.hidden {
		display: none;
	}

	@media (min-width: ${ props => props.theme.desktopCardWidth }) {
		flex-basis: 70%;
		flex-grow: 2;
		order: 1;
		max-height: ${ props => props.theme.desktopCardHeight };
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

class IngredientCard extends Component {
	initialState = {
		modal: {},
		pending: {},
		warnings: [],

		isEditMode: false,
		isModalEnabled: false
	};

	state = this.initialState;

	componentDidMount = () => {
		const { view } = this.props;

		this.setState({
			isEditMode: (view === 'new') ? true : false 
		});
	}

	componentDidUpdate = (prevProps) => {
		const { view } = this.props;

		if (view !== prevProps.view) {
			this.setState({
				isEditMode: (view === 'new') ? true : false 
			});
		}
	}

	onToggleEditMode = (e) => {
		e.preventDefault();
		const { isEditMode } = this.state;

		this.setState({
			isEditMode: !isEditMode
		});
	}

	onToggleModal = (e, type) => {
		e.preventDefault();
		const { isModalEnabled } = this.state;
		let modal = {};

		switch(type) {
			case 'error':
				modal.label = 'Save';
				modal.title = 'Select an Error Type';
				modal.type = 'error';
				modal.values = {
					associated: [],
					type: null // [ 'data', 'semantic', 'instruction', 'equipment' ]
				};
				break;
			case 'merge':
				modal.label = 'Merge';
				modal.title = 'Merge Ingredient With';
				modal.type = 'merge';
				modal.values = {
					associated: [],
					type: null 
				};
				break;
			case 'parent':
				modal.label = 'Assign';
				modal.title = 'Assign Parent';
				modal.type = 'parent';
				modal.values = {
					associated: [],
					type: null 
				};
				break;
			default:
				break;	
		}

		this.setState({
			isModalEnabled: !isModalEnabled,
			modal
		});
	}

	onCancelClick = (e) => {
		e.preventDefault();
		this.setState(this.initialState);
	}

	onCheckboxChange = (e, fieldName, defaultValue) => {
		const pending = { ...this.state.pending };

		switch (fieldName) {
			case 'properties':
				// make sure you're spreading these values to safely copy!
				//let properties = (pending.hasOwnProperty('properties')) ? { ...pending.properties } : { ...defaultValue };
				let properties = (pending.hasOwnProperty('properties')) ? JSON.parse(JSON.stringify(pending.properties)) : { ...defaultValue };

				Object.entries(properties).forEach(([ key, value ]) => {
		  		if (key === e.target.value) {
		  			properties[key] = !value;
		  		}
		  	});

		  	this.setState({
		  		pending: {  ...pending, ...{ properties: properties } }
		  	});
		  	break;

		  case 'isComposedIngredient':
		  	const isComposedIngredient = (pending.hasOwnProperty('isComposedIngredient')) ? pending.isComposedIngredient : defaultValue.isComposedIngredient;
		  	
		  	this.setState({
		  		pending: {  ...pending, ...{ isComposedIngredient: !isComposedIngredient } }
		  	});
		  	break;

		  case 'isValidated':
		  	const isValidated = (pending.hasOwnProperty('isValidated')) ? pending.isValidated : defaultValue.isValidated;

		  	this.setState({
		  		pending: {  ...pending, ...{ isValidated: !isValidated } }
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
		const pending = { ...this.state.pending };	// TODO double check
		const warnings = this.validate(value, name);

		this.setState({
			pending: { ...pending, ...{ [name]: value } },
			warnings
		});
	}

	onListChange = (listItem, fieldName, removeListItem = false) => {
		const pending = { ...this.state.pending };	// TODO double check
		let mutationFieldName = '';

		if (fieldName === 'alternateNames') {
			mutationFieldName = (!removeListItem) ? 'alternateNames_Create' : 'alternateNames_Delete';
		} else {
			mutationFieldName = (!removeListItem) ? `${ fieldName }_Connect` : `${ fieldName }_Disconnect`;
		}

		let updatedList = (pending.hasOwnProperty(mutationFieldName)) ? [ ...pending[mutationFieldName] ] :[];
		updatedList.push(listItem);

		// if we're removing this item, we may need to also remove it from the opposing list
		if (removeListItem) {
			let opposingListName = [];
			
			if (fieldName === 'alternateNames') {
				opposingListName = (!removeListItem) ? 'alternateNames_Delete' : 'alternateNames_Create';
			} else {
				opposingListName = (!removeListItem) ? `${ fieldName }_Disconnect` : `${ fieldName }_Connect`;
			}

			let opposingList = (pending.hasOwnProperty(opposingListName)) ? [ ...pending[opposingListName] ] :[];
			
			if (opposingList.indexOf(listItem) > -1) {
				updatedList.splice(updatedList.indexOf(listItem), 1);
			}
		}

		// re-validate the ingredient
 		const warnings = this.validate((removeListItem) ? null : listItem, fieldName);

		this.setState({
			pending: {  ...pending, ...{ [mutationFieldName]: updatedList } },
			warnings
		});
	}

	onSaveIngredient = async (e, mutation, query) => {
		e.preventDefault();

		// ensure that we don't have any warnings that prevent this from being created
		const warnings = [ ...this.state.warnings ]; // TODO double check
		let isValid = (warnings.filter(w => w.isPreventSave).length === 0) ? true : false;

		if (isValid) {
			const variables = { ...this.state.pending }; // TODO double check

			// cleanup variables state values
			variables.id = this.props.currentIngredientID;
			variables.isValidated = true;		// approve ingredient updates to move the out of the 'new' view

			// clean up properties typename
			if (variables.hasOwnProperty('properties') && variables.properties.hasOwnProperty('__typename')) { delete variables.properties.__typename; }
			
			// clean up alt name update lists to only contain strings
			if (variables.hasOwnProperty('alternateNames_Create')) { variables.alternateNames_Create = variables.alternateNames_Create.map(i => i.name); }
			if (variables.hasOwnProperty('alternateNames_Delete')) { variables.alternateNames_Delete = variables.alternateNames_Delete.map(i => i.name); }
			
			// clean up related and substitute update lists to only contain ids
			if (variables.hasOwnProperty('relatedIngredients_Connect')) { variables.relatedIngredients_Connect = variables.relatedIngredients_Connect.map(i => i.id); }
			if (variables.hasOwnProperty('relatedIngredients_Disconnect')) { variables.relatedIngredients_Disconnect = variables.relatedIngredients_Disconnect.map(i => i.id); }
			if (variables.hasOwnProperty('substitutes_Connect')) { variables.substitutes_Connect = variables.substitutes_Connect.map(i => i.id); }
			if (variables.hasOwnProperty('substitutes_Disconnect')) { variables.substitutes_Disconnect = variables.substitutes_Disconnect.map(i => i.id); }
			
			await mutation({ variables })
						.then(res => {
							console.warn('response:');
							console.warn(res.data.updateIngredient);

							// clear out pending changes and refresh the view
							this.setState(this.initialState, this.refreshCard(e));
						});
		}
	}

	onSuggestPlural = (e, defaultName) => {
  	e.preventDefault();
  	const pending = { ...this.state.pending };

  	const name = (pending.hasOwnProperty('name')) ? pending.name : defaultName;
  	const plural = (name) ? pluralize(name) : '';

  	this.setState({
  		pending: {  ...pending, ... { plural } } 
  	}, () => this.validate(plural, 'plural'));
  }

  onSuggestedRelationClick = (e, item) => {
  	e.preventDefault();
  	const pending = { ...this.state.pending };

  	let relatedIngredients_Connect = (pending.hasOwnProperty('relatedIngredients_Connect')) ? [ ...pending.relatedIngredients_Connect ] : [];
  	relatedIngredients_Connect.push({ id: item.id, name: item.name });

  	this.setState({
  		pending: {  ...pending, ...{ relatedIngredients_Connect } }
  	});
  }

  populateSuggestions(ingredient, ingredients, isEditMode) {
	  let related = [];
  	const { id = null, name = '' , plural = '' } = ingredient;
  	const alternateNames = (ingredient.hasOwnProperty('alternateNames')) ? [ ...ingredient.alternateNames ] : [];
  	const relatedIngredients = (ingredient.hasOwnProperty('relatedIngredients')) ? [ ...ingredient.relatedIngredients ] : [];

  	// TODO this could be more sensible, but it's a short term solution for now
  	// in the future consider hooking this up to some of the vocab lists used in the PEG grammar
  	const excludedWords = [ 'a', 'from', 'the', 'you', 'be', 'for', 'with', 'plus' ];

		if (isEditMode) {
  		// split the name into individual words ('active dry yeast' => ['active', 'dry', 'yeast'])
  		//let keywordList = [ ...name.split(' '), ...plural.split(' '), ...alternateNames.map(n => n.split(' ')) ];
  		const splitName = (name) ? [ ...name.toLowerCase().split(' ') ] : [],
  					splitPlural = (plural) ? [ ...plural.toLowerCase().split(' ') ] : [],
  					splitAlt = (alternateNames) ? [ ...alternateNames.map(n => n.name.toLowerCase().split(' ')) ] : [];

  		let keywordList = [].concat(...[ ...splitName, ...splitPlural, ...splitAlt ]);
  		keywordList = [].concat(...keywordList).filter(k => k);

  		// and for each word in the ingredient's name, see if it's used an ingredient elsewhere
  		for (let w in keywordList) {
  			const word = keywordList[w]; // 'yeast'

  			if (!~excludedWords.indexOf(word)) {
	  			ingredients.filter(i =>
	  				// don't return the current ingredient
	  				(i.id !== id)
	  				// or any ingredients already listed as related
	  				&& (relatedIngredients && !(relatedIngredients.find(r => r.id === i.id)))
	  				// find any ingredients with a partial match on each ingredient word
	  				&&
	  					(
	  						(i.name && i.name.indexOf(word) > -1)
		  					|| (i.plural && i.plural.indexOf(word) > -1)
		  					|| (i.alternateNames && i.alternateNames.find(n => n.name.indexOf(word) > -1))
		  				)
	  				// TODO and it doesn't match any pending values on our ingredient that are going to trigger a merge with another ingredient
	  				&& (
	  					(i.name !== ingredient.name)
	  					&& (i.name !== ingredient.plural)
	  					&& (!~ingredient.alternateNames.findIndex(n => n.name === i.name))

	  					&& (i.plural !== ingredient.name)
	  					&& (i.plural !== ingredient.plural)
	  					&& (!~ingredient.alternateNames.findIndex(n => n.name === i.plural))

	  					&& (!~i.alternateNames.findIndex(n => (n.name === ingredient.name)))
	  					&& (!~i.alternateNames.findIndex(n => (n.name === ingredient.plural)))
	  					&& (!this.hasDuplicateEntries([ ...i.alternateNames, ...ingredient.alternateNames ], 'name'))
	  				)
  				)
  				.map(i => [ i.id, i.name ])
  				// populate our related ingredients list with an associated weight of how close of a match this is
  				.forEach(i => {
  					if (!related.find(ing => ing.name.includes(i[1]))) {
							// TODO this is a whole research topic and i'm not even convinced that this is the 'best' weight to use
							// but levenshtein is pretty familiar to me and it works JUST OKAY for the time being 
							related.push({ name: i[1], score: levenshtein.get(name, i[1]), id: i[0] });
						}
  				});
	  		}
  		}

  		// filter and sort by our arbitrary scoring mechanism
	  	related = related.filter(i => i.score > .25 && i.score !== 1);
	  	related = related.sort((a, b) => ((a.score < b.score) ? -1 : (a.score > b.score) ? 1 : 0) * 1);
		}
		
		return related;
	}

	refreshCard = (e) => {
		const { container, view } = this.props;
		const ingredients = [ ...container.ingredients ]; 	// TODO double check
		let nextIngredient = null;

		// if we're in the 'new' view and there's more ingredients left in our container, 
		// then show the next ingredient in the list
		if (view === 'new' && ingredients && (ingredients.length > 0)) {
			const index = ingredients.findIndex(i => i.id === container.settings.currentIngredientID);

			if ((index + 1) <= ingredients.length) {
				nextIngredient = { ...ingredients[(index + 1)] };	 // TODO okay now use this!
			}
		}

		this.props.refreshView(nextIngredient);
	}

	validate = (value, fieldName = '') => {
		console.warn('validate');
		console.warn(value);

		const { currentIngredientID, ingredients } = this.props;
		const pending = { ...this.state.pending }; // TODO do the usual checks
  	const warnings = [];
  	let excludedFields = [ fieldName ];

  	// TODO ugh this is a mess, come back to this and clean this up
		const testWarning = (inputValue, excludedFields = [], name) => {
			if ((typeof inputValue === 'object') && inputValue.hasOwnProperty('name')) {
				inputValue = inputValue.name;
			}

			inputValue = inputValue.toLowerCase();
			let existing;
			
			let matchOnName = false, matchOnPlural = false, matchOnAltName = false;

			// determine if this value is used elsewhere on this, or any other, ingredient
			const isValueAlreadyUsed = ing => {
				const isCurrentIng = (ing.id === currentIngredientID);

				if (isCurrentIng) {
					// apply pending updates
					if ((fieldName !== 'name') && pending.hasOwnProperty('name')) {
						// pending are prior changes that have happened
						// we want to override the props idea of this ingredient with those changes
						ing.name = pending.name;
					}

					if ((fieldName !== 'plural') && pending.hasOwnProperty('plural')) {
						ing.plural = pending.plural;
					}

					if (pending.hasOwnProperty('alternateNames_Create') || pending.hasOwnProperty('alternateNames_Delete')) {
						ing.alternateNames = this.populateListUpdates('alternateNames', ing.alternateNames);
					}

					// if we're currently editing this field, then don't validate against it
					excludedFields.forEach(field => {
						if (field !== 'alternateNames') {
							ing[field] = '';
						}
						// TODO do we need to handle alt names specially here? or does this not apply
					});

				}

				matchOnName = (ing.name && (ing.name !== '') && (ing.name.toLowerCase() === inputValue));
				matchOnPlural = (ing.plural && (ing.plural !== '') && (ing.plural.toLowerCase() === inputValue));
				matchOnAltName = (ing.alternateNames && ing.alternateNames.findIndex(n => n.name.toLowerCase() === inputValue) > -1);

				//console.warn({ fieldName, ing, matchOnName, matchOnPlural, matchOnAltName });

				if (matchOnName || matchOnPlural || matchOnAltName) {
					existing = Object.assign({}, ing);
					return true;
				}
				return false;
			};

			if (ingredients.some(isValueAlreadyUsed)) {
				warnings.push({
					fieldName: name,
					message: (existing.id === currentIngredientID)
										? `Warning! '${ inputValue }' is used on multiple fields on this ingredient!`
										: `Attention! Assigning '${ inputValue }' to this ingredient will merge these records!`,
					isPreventSave: (existing.id === currentIngredientID) ? true : false,
					value: inputValue
				});

				if (existing.id === currentIngredientID) {
					// if our validation failed on a field on this ingredient, check if we need to highlight those ingredients

					if (matchOnName && (fieldName !== 'name')) {
						warnings.push({
							fieldName: 'name',
							message: `Warning! '${ inputValue }' is used on multiple fields on this ingredient. Move this value into a single field in order to save changes.`,
							isPreventSave: true,
							value: inputValue
						});
					}

					if (matchOnPlural && (fieldName !== 'plural')) {
						warnings.push({
							fieldName: 'plural',
							message: `Warning! '${ inputValue }' is used on multiple fields on this ingredient. Move this value into a single field in order to save changes.`,
							isPreventSave: true,
							value: inputValue
						});
					}

					if (matchOnAltName && (fieldName !== 'alternateNames')) {
						warnings.push({
							fieldName: 'alternateNames',
							message: `Warning! '${ inputValue }' is used on multiple fields on this ingredient. Move this value into a single field in order to save changes.`,
							isPreventSave: true,
							value: inputValue
						});
					}
				}
			}
		}

		const hasDuplicateEntries = (array, fieldName) => {
			array = array.map(w => w[fieldName]);
			return array.some((value, index, array) => array.indexOf(value) !== array.lastIndexOf(value));
		};

		// if this value is used elsewhere, add an appropriate warning to the warnings list
		if (value) {
			testWarning(value, excludedFields, fieldName);
		}

		// re-validate the remainder of the validated pending update fields
		if ((fieldName !== 'name') && pending.hasOwnProperty('name')) {
			excludedFields.push('name');
			testWarning(pending.name, excludedFields, 'name');
		}

		if ((fieldName !== 'plural') && pending.hasOwnProperty('plural')) {
			excludedFields.push('plural');
			testWarning(pending.plural, excludedFields, 'plural');
		}

		if ((fieldName !== 'alternateNames') && pending.hasOwnProperty('alternateNames_Create')) {
			pending.alternateNames_Create.forEach(n => {

				excludedFields.push('alternateNames'); // TODO or maybe alternateNames_Create?
				testWarning(n, excludedFields, 'alternateNames');
			})
		}

		if (hasDuplicateEntries([ ...warnings ], 'value')) {
			warnings.push({
				fieldName: 'multiple',
				message: `Warning! '${ value.name || value }' is used on multiple fields on this ingredient. Move this value into a single field in order to save changes.`,
				isPreventSave: true,
				value
			});
		}

 		return warnings;
 	}

 	// this is responsible for setting state
 	onValidation = (value, name) => {
		const warnings = this.validate(value, name);

		this.setState({
			warnings
		});
	}

  // TODO DRY this up
  populateListUpdates = (listName, list) => {
  	const pending = { ...this.state.pending };
  	let updates = (list) ? [ ...list ] : []; 

  	if (pending.hasOwnProperty(`${ listName }_Connect`)) {
  		pending[`${ listName }_Connect`].forEach(c => {
  			if (!~updates.indexOf(c)) {
					updates.push(c);
				}
			});
  	}

  	if (pending.hasOwnProperty(`${ listName }_Create`)) {
  		pending[`${ listName }_Create`].forEach(c => {
  			if (!~updates.indexOf(c)) {
					updates.push(c);
				}
			});
  	}
  	
  	if (pending.hasOwnProperty(`${ listName }_Disconnect`)) {
			pending[`${ listName }_Disconnect`].forEach(d => {
				const index = updates.findIndex(item => item.id === d.id);
				if (index !== -1) { updates.splice(index, 1); }
			});
		}

  	if (pending.hasOwnProperty(`${ listName }_Delete`)) {
			pending[`${ listName }_Delete`].forEach(d => {
				const index = updates.findIndex(item => item.name === d.name);
				if (index !== -1) { updates.splice(index, 1); }
			});
		}

		return updates;
  }

	render() {
		const { container, currentIngredientID, ingredients, view } = this.props;
		const { isEditMode, isModalEnabled, modal, warnings } = this.state;
		const pending = { ...this.state.pending };
		const excludedSuggestions = {};

		return (
			<CardStyles className={ (!container.settings.isExpanded) ? 'hidden' : '' }>
				<Composed id={ currentIngredientID }>
					{
						({ getIngredient, updateIngredient }) => {
							const { data, error, loading } = getIngredient;
							if (loading) return <p>Loading...</p>; // TODO adjust
							if (error) return <p>Error: { error.message }</p>;

							const { name, plural, properties, alternateNames, relatedIngredients, substitutes,
											id, isComposedIngredient, references } = data.ingredient || '';

							// merge pending updates with saved data
							const pendingRelatedIngredients = this.populateListUpdates('relatedIngredients', relatedIngredients),
										pendingSubstitutes = this.populateListUpdates('substitutes', substitutes),
										pendingAlternateNames = this.populateListUpdates('alternateNames', alternateNames);

							// combined saved ingredient values with any pending updates
							excludedSuggestions.id = data.ingredient.id;
							excludedSuggestions.name = (pending.hasOwnProperty('name')) ? pending.name : name;
							excludedSuggestions.plural = (pending.hasOwnProperty('plural')) ? pending.plural : plural;
							//excludedSuggestions.alternateNames = (pending.hasOwnProperty('alternateNames')) ? [ ...pending.alternateNames ] : [ ...alternateNames ];
							excludedSuggestions.alternateNames = pendingAlternateNames;

							// add in relatedIngredients so we can keep these out of our related suggestions
							excludedSuggestions.relatedIngredients = pendingRelatedIngredients;

							// build list of suggested related ingredients
							const suggestedRelations = this.populateSuggestions(excludedSuggestions, ingredients, isEditMode);

							let checkboxes = (isEditMode && pending.hasOwnProperty('properties')) ? pending.properties : properties;
							if (checkboxes.hasOwnProperty('__typename')) {
								delete checkboxes.__typename;
							}

							return ( 
								<IngredientForm onSubmit={ e => this.onSaveIngredient(e, updateIngredient, getIngredient) } autoComplete='off'>
									{
										(isModalEnabled && modal)
											? <Modal
													label={ modal.label }
													onCancel={ this.onToggleModal }
													title={ modal.title }
												/>
											: null
									}
									<div className='top'>
										<div className='left'>
											{/* Name */}
						    			<Input
						    				className='name'
												defaultValue={ name }
						    				isEditMode={ isEditMode }
						  					isLabelDisplayed={ false }
												isRequiredField={ true }
												name={ 'name' }
						  					onChange={ this.onInputChange }
						  					placeholder={ 'name' }
						  					suppressWarnings={ true }
						  					value={ pending.name }
						  					warning={ warnings.filter(w => w.fieldName === 'name')[0] }
						    			/>

						    			{/* Plural */}
						    			<Input
						    				className='plural'
						    				defaultValue={ plural }
						    				isEditMode={ isEditMode }
						  					isLabelDisplayed={ false }
						  					isPluralSuggestEnabled={ true }
												name={ 'plural' }
						  					onChange={ this.onInputChange }
						  					onSuggestPlural={ e => this.onSuggestPlural(e, name) }
						  					placeholder={ 'plural' }
						  					suppressWarnings={ true }
						  					value={ pending.plural }
						  					warning={ warnings.filter(w => w.fieldName === 'plural')[0] }
						    			/>
						    		</div>

										<div className='right'>
						    			{/* Properties */}
						    			<CheckboxGroup
						    				className={ 'properties' }
						    				isEditMode={ isEditMode }
						    				key={ `card_properties_${ id }` }
						    				keys={ [ ...Object.keys(checkboxes) ] }
						    				name='properties'
						  					onChange={ e => this.onCheckboxChange(e, 'properties', properties) }
						  					onKeyDown={ e => this.onCheckboxKeyDown(e, 'properties', properties) }
						  					values={ [ ...Object.values(checkboxes) ] }
											/>

						    			{/* Is Composed Ingredient */}
											<CheckboxGroup
						    				className={ 'isComposedIngredient' }
						    				isEditMode={ isEditMode }
						    				key={ `card_isComposed_${ id }` }
						    				keys={ [ 'Is Composed Ingredient?' ] }
						    				name='isComposedIngredient'
						  					onChange={ e => this.onCheckboxChange(e, 'isComposedIngredient', isComposedIngredient) }
						  					onKeyDown={ e => this.onCheckboxKeyDown(e, 'isComposedIngredient', isComposedIngredient) }
						  					values={ [ (isEditMode && pending.hasOwnProperty('isComposedIngredient')) ? pending.isComposedIngredient : isComposedIngredient ] }
											/>
										</div>
									</div>

									<div className='middle'>
										<div className='left'>
											{/* Alternate Names */}
						    			<List
						    				className='altNames'
						    				defaultValues={ alternateNames }
						    				isEditMode={ isEditMode }
						    				isPluralSuggestEnabled={ true }
						    				isRemoveable={ true }
												label={ 'Alternate Names' }
						  					loading={ false }
												name={ 'alternateNames' }
						  					onListChange={ this.onListChange }
						  					onSuggestPlural={ this.onSuggestPlural }
						  					onValidation={ this.onValidation }
						  					placeholder={ 'alternate name' }
												required={ false }
						  					showSuggestions={ false }
						  					suppressWarnings={ true }
						  					warnings={ warnings.filter(w => w.fieldName === 'alternateNames') } 
						  					values={ pendingAlternateNames }
						  					validate={ this.validate }
						    			/>

						    			{/* Related Ingredients */}
						    			<List
						    				className='related'
						    				defaultValues={ relatedIngredients }
						    				excludedSuggestions={ excludedSuggestions }
						    				isEditMode={ isEditMode }
						    				isRemoveable={ true }
						    				isSuggestionEnabled={ true }
												label={ 'Related Ingredients' }
						  					loading={ false }
												name={ 'relatedIngredients' }
						  					onListChange={ this.onListChange }
						  					placeholder={ 'related ingredient' }
												required={ false }
						  					showSuggestions={ true }
						  					suggestionPool={ ingredients }
						  					type={ 'link' }
						  					values={ pendingRelatedIngredients }
						    			/>

											{/* Substitutes */}
						    			<List
						    				defaultValues={ substitutes }
						    				className='substitutes'
						    				excludedSuggestions={ excludedSuggestions }
						    				isEditMode={ isEditMode }
						    				isRemoveable={ true }
						    				isSuggestionEnabled={ true }
												label={ 'Substitutes' }
						  					loading={ false }
												name={ 'substitutes' }
						  					onListChange={ this.onListChange }
						  					placeholder={ 'substitute' }
												required={ false }
						  					showSuggestions={ true }
						  					suggestionPool={ ingredients }
						  					type={ 'link' }
						  					values={ pendingSubstitutes }
						    			/>
										</div>

										<div className='right'>
											{/* References */}
											<List
						    				className='references'
						  					defaultValues={ references }
						    				isEditMode={ false }
												label={ 'References' }
						  					loading={ false }
												name={ 'references' }
						  					type={ 'link' }
						    			/>

						    			{/* Suggested Relations */}
						    			<List
						    				className='suggestedRelations'
						  					defaultValues={ suggestedRelations }
						    				isEditMode={ false }
												label={ 'Suggestion Relations' }
						  					loading={ false }
						  					onListItemClick={ this.onSuggestedRelationClick }
												name={ 'suggestedRelations' }
						  					type={ 'suggestion' }
						    			/>
										</div>
									</div>

									<div className='bottom'>
										{
											(!isEditMode)
												? <Button
										  			className='edit'
										  			icon={ <FontAwesomeIcon icon={ faEdit } /> }
										  			label='Edit'
										  			onClick={ e => this.onToggleEditMode(e) }
										  		/>
										  	: <React.Fragment>
										  			<div className='left'>
										  				<div className='actions'>
											  				{/* TODO */}
											  				<Button
													  			className='merge'
													  			icon={ <FontAwesomeIcon icon={ faCodeMerge } /> }
													  			onClick={ e => this.onToggleModal(e, 'merge') }
													  			label='Merge Ingredient'
													  		/>
													  		
													  		{/* TODO */}
													  		<Button
													  			className='parent'
													  			icon={ <FontAwesomeIcon icon={ faPlus } /> }
													  			onClick={ e => this.onToggleModal(e, 'parent') }
													  			label='Assign Parent'
													  		/>

													  		{/* TODO */}
													  		<Button
													  			className='parsingError'
													  			icon={ <FontAwesomeIcon icon={ faExclamation } /> }
													  			onClick={ e => this.onToggleModal(e, 'error') }
													  			label='Parsing Error' 
													  		/>
												  		</div>
										  			</div>

										  			<div className='right'>
										  				{/* Warning Messages */}
										  			  { [ ...new Set(warnings.map(w => w.message))].map((w, index) => <div className='warning' key={ `warning_${ index }` }>{ w }</div>) }

										  				<Button
												  			className='cancel'
												  			onClick={ e => this.onCancelClick(e) }
												  			label='Cancel'
												  		/>

												  		<Button
												  			className='save'
												  			label='Save'
												  			type='submit'
												  		/>
										  			</div>
										  		</React.Fragment>
										}
									</div>
			    			</IngredientForm>
							);
						}
					}
				</Composed>
			</CardStyles>
		);		
	}
}

IngredientCard.defaultProps = {
	container: {
		id: 0,
		ingredients: [],
		label: 'All Ingredients',
		message: 'Loading...',
		settings: {
			currentIngredientID: null,
			isCardEnabeld: false,
			isExpanded: true,
			typename: '__IngredientViewState'
		}
	},
	view: 'all',
	ingredients: [],
};

IngredientCard.propTypes = {
	container: PropTypes.object,
	currentIngredientID: PropTypes.string.isRequired,
	view: PropTypes.string,
	ingredients: PropTypes.array,
	refreshView: PropTypes.func,
	updateLocalCache: PropTypes.object
};

export default IngredientCard;
export { CURRENT_INGREDIENT_QUERY };
