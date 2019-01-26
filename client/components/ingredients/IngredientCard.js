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

import Button from '../form/Button';
import CheckboxGroup from '../form/CheckboxGroup';
import Input from '../form/Input';
import List from '../form/List';

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
			alternateNames
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
				title
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
		$alternateNames: [ String ]
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
	    alternateNames: $alternateNames
	    relatedIngredients_Connect: $relatedIngredients_Connect
	    relatedIngredients_Disconnect: $relatedIngredients_Disconnect
	    substitutes_Connect: $substitutes_Connect
	    substitutes_Disconnect: $substitutes_Disconnect
	    isValidated: $isValidated
	    isComposedIngredient: $isComposedIngredient
    ) {
      id
    }
  }
`;
// TODO do we need all these fields in the return?

const Composed = adopt({
	getIngredient: ({ render, getIngredientVariables }) => <Query query={ CURRENT_INGREDIENT_QUERY } variables={ { id: getIngredientVariables } }>{ render }</Query>,
	updateIngredient: ({ render }) => <Mutation mutation={ UPDATE_INGREDIENT_MUTATION }>{ render }</Mutation>
});

const CardStyles = styled.div`
	max-height: ${ props => props.theme.mobileCardHeight };
	padding: 20px;
	border-bottom: 1px solid #ddd;
	width: 100%;

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
			}
		}
	}
`;

// TODO there is so much duplicated code between this and the create component;
// see if we can DRY this up

class IngredientCard extends Component {
	initialState = {
		loading: false,
		pending: {

		},
		warnings: {
			name: '',
			plural: '',
			alternateNames: '',
		},

		isEditMode: false
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

	onCancelClick = (e) => {
		e.preventDefault();
		this.setState(this.initialState, () => { console.log(this.state); });
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

	onInputChange = (e, defaultValue) => {
		const { name, value } = e.target;
		const pending = { ...this.state.pending };

		this.setState({
			pending: { ...pending, ...{ [name]: value } }
		}, this.onValidation(name, value, defaultValue));
	}

	onListChange = (item, listName, listType, toRemove = false, defaultValue) => {
		// determine if this entry is valid
		const warning = this.validate(item);
		const pending = { ...this.state.pending };
		const connect = `${ listName }_Connect`, disconnect = `${ listName }_Disconnect`;

		listName = (listType === 'link') ? `${ listName }_${ (toRemove) ? 'Disc' : 'C' }onnect` : listName;

		if (toRemove || !warning) {
			let currentList = [];

			// if we don't have any prior modifications to this list, just use the default value
			if (!pending.hasOwnProperty(listName) && !pending.hasOwnProperty(connect) && !pending.hasOwnProperty(disconnect)) {
				currentList = [ ...defaultValue ];
			} else {
				currentList = pending.hasOwnProperty(listName) ? pending[listName] : [];
			}

			const index = (currentList) ? currentList.indexOf(item) : -1;

			if (listType !== 'link' && toRemove && index > -1) {
				// remove the item from the list (for simple lists such as alternateNames)
				currentList.splice(index, 1);
			} else if (index === -1) {
				// add the item to the list
				currentList.push(item);
			}

			this.setState({
				pending: {  ...pending, ...{ [listName]: currentList } }
			});
			
		} else {
			// clear out validation if we hit return on an invalid item
			this.onValidation(listName, '');
		}
	}

	onSaveIngredient = async (e, mutation, query) => {
		e.preventDefault();

		// ensure that we don't have any warnings that prevent this from being created
		const warnings = { ...this.state.warnings };
		let isValid = true;

		for (let [ key, value ] of Object.entries(warnings)) {
			if (value) {
				isValid = false;
			}
		}

		if (isValid) {
			const pending = { ...this.state.pending }; // TODO is this a deep enough copy?

			// cleanup pending state values
			pending.id = this.props.currentIngredientID;
			pending.isValidated = true;		// approve ingredient updates to move the out of the 'new' view

			if (pending.hasOwnProperty('properties') && pending.properties.hasOwnProperty('__typename')) {
				delete pending.properties.__typename;
			}

			if (pending.hasOwnProperty('relatedIngredients_Connect')) {
				pending.relatedIngredients_Connect = pending.relatedIngredients_Connect.map(i => i.id);
			}

			if (pending.hasOwnProperty('relatedIngredients_Disconnect')) {
				pending.relatedIngredients_Disconnect = pending.relatedIngredients_Disconnect.map(i => i.id);
			}

			if (pending.hasOwnProperty('substitutes_Connect')) {
				pending.substitutes_Connect = pending.substitutes_Connect.map(i => i.id);
			}

			if (pending.hasOwnProperty('substitutes_Disconnect')) {
				pending.substitutes_Disconnect = pending.substitutes_Disconnect.map(i => i.id);
			}

			this.setState({
				loading: true
			}, await this.updateIngredient(e, pending, mutation, query));
			
		}
	}

	onSuggestPlural = (e, defaultName) => {
  	e.preventDefault();
  	const pending = { ...this.state.pending };

  	const name = (pending.hasOwnProperty('name')) ? pending.name : defaultName;
  	const plural = (name) ? pluralize(name) : '';

  	this.setState({
  		pending: {  ...pending, ... { plural } }
  	}, this.onValidation('plural', plural));
  }

  onSuggestedRelationClick = (e, item) => {
  	e.preventDefault();
  	const pending = { ...this.state.pending };

  	// add to relatedIngredients
  	let relatedIngredients = (pending.hasOwnProperty('relatedIngredients')) ? [ ...pending.relatedIngredients ] : [];
  	relatedIngredients.push(item);

  	this.setState({
  		pending: {  ...pending, ...{ relatedIngredients } }
  	});
  }

	onValidation = (fieldName, value, defaultValue) => {
  	let warnings = { ...this.state.warnings };

		if (warnings.hasOwnProperty(fieldName)) {
			warnings[fieldName] = this.validate(value, defaultValue);

			this.setState({
				warnings
			});
		}
  }

  populateSuggestions(ingredient, ingredients, isEditMode) {
	  let related = [];
  	const { name, plural, alternateNames, relatedIngredients } = ingredient || '';
  	// TODO this could be more sensible, but it's a short term solution for now
  	// in the future consider hooking this up to some of the vocab lists used in the PEG grammar
  	const excludedWords = [ 'a', 'from', 'the', 'you', 'be', 'for', 'with', 'plus' ];

		if (ingredient && isEditMode && name) {
  		// split the name into individual words ('active dry yeast' => ['active', 'dry', 'yeast'])
  		let keywordList = [ ...name.split(' '), ...plural.split(' '), ...alternateNames.map(n => n.split(' ')) ];
  		keywordList = [].concat(...keywordList).filter(k => k);

  		// and for each word in the ingredient's name, see if it's used an ingredient elsewhere
  		for (let w in keywordList) {
  			const word = keywordList[w]; // 'yeast'

  			if (!excludedWords.includes(word)) {
	  			ingredients.filter(i =>
	  				// don't return the current ingredient
	  				(i.id !== ingredient.id)
	  				// or any ingredients already listed as related
	  				&& !(relatedIngredients.find(r => r.id === i.id))
	  				// find any ingredients with a partial match on each ingredient word
	  				&&
	  					(
	  						(i.name && i.name.indexOf(word) > -1)
		  					|| (i.plural && i.plural.indexOf(word) > -1)
		  					|| (i.alternateNames && i.alternateNames.find(n => n.indexOf(word) > -1))
		  				)
	  				)
	  				.map(i => [ i.id, i.name ])
	  				// populate our related ingredients list with an associated weight of how close of a match this is
	  				.forEach(i => {
	  					if (!related.find(ing => ing.name.includes(i[1]))) {
								// TODO this is a whole research topic and i'm not even convinced that this is the "best" weight to use
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
		const { container, view, localState, populateContainers, ingredientCounts, updateContainer } = this.props;
		const { currentIngredientID, ingredients } = container;
		let nextIngredient = null;

		// if we're in the 'new' view and there's more ingredients left in our container, 
		// then show the next ingredient in the list
		if (view === 'new' && ingredients && (ingredients.length > 0)) {

			const index = ingredients.findIndex(i => i.id === currentIngredientID);

			if ((index + 1) <= ingredients.length) {
				nextIngredient = { ...ingredients[(index + 1)] };
			}
		}

		// then update the parent view
		// TODO this is a mess
		this.props.refreshContainers(e, localState, populateContainers, ingredientCounts, container, updateContainer, nextIngredient);
	}

	updateIngredient = async (e, variables, mutation, query) => {
		await mutation({ variables })
						.then(res => {
							// refetch ingredient data
							query.refetch();

							// clear out pending changes and refresh the view
							this.setState(
								this.initialState,
								this.refreshCard(e)
							);
						});
	};

	validate = (value, defaultValue = null) => {
  	const { ingredients } = this.props;

  	if (ingredients && (value !== defaultValue)) {
	  	const existing = ingredients.find(i =>
	  		// don't throw warnings if we end up back at our original starting point
	  		(i.name !== defaultValue)
	  		&& (
		  		(i.name === value)
		  		|| (i.plural === value) 
		  		|| (~i.alternateNames.indexOf(value))
  			)
	  	);
			return (existing) ? `The ingredient ${ value } already exists!` : '';
		}

		return '';
  }

  populateListUpdates = (listName, list) => {
  	const pending = { ...this.state.pending };
  	let updates = [ ...list ];

  	if (pending.hasOwnProperty(`${ listName }_Disconnect`)) {
			pending[`${ listName }_Disconnect`].forEach(d => {
				const index = updates.findIndex(item => item.id === d.id);
				if (index !== -1) { updates.splice(index, 1); }
			});
		}

  	if (pending.hasOwnProperty(`${ listName }_Connect`)) {
  		pending[`${ listName }_Connect`].forEach(c => {
  			// add the
  			if (!~updates.indexOf(c)) {
					updates.push(c);
				}
			});
  	}

		return updates;
  }

  // TODO re-populate form with results from updateIngredient
	render() {
		const { container, currentIngredientID, view, ingredients } = this.props;
		const { isEditMode, warnings } = this.state;
		const pending = { ...this.state.pending };
		const excludedSuggestions = {};

		return (
			<CardStyles className={ (!container.isExpanded) ? 'hidden' : '' }>
				<Composed getIngredientVariables={ currentIngredientID }>
					{
						({ getIngredient, updateIngredient }) => {
							const { data, error, loading } = getIngredient;
							if (loading) return <p>Loading...</p>; // TODO adjust
							if (error) return <p>Error: { error.message }</p>;

							const { name, plural, properties, alternateNames, relatedIngredients, substitutes,
											id, isComposedIngredient, references } = data.ingredient || '';

							// combined saved ingredient values with any pending updates
							excludedSuggestions.id = data.ingredient.id;
							excludedSuggestions.name = (pending.hasOwnProperty('name')) ? pending.name : name;
							excludedSuggestions.plural = (pending.hasOwnProperty('plural')) ? pending.plural : plural;
							excludedSuggestions.alternateNames = (pending.hasOwnProperty('alternateNames')) ? pending.alternateNames : alternateNames;
							
							// add in relatedIngredients so we can keep these out of our related suggestions
							// i don't think there's any reason we need to include substitutes into excludedSuggestions at this point
							excludedSuggestions.relatedIngredients = (pending.hasOwnProperty('relatedIngredients')) ? pending.relatedIngredients : relatedIngredients;
							
							const pendingRelatedIngredients = this.populateListUpdates('relatedIngredients', relatedIngredients),
										pendingSubstitutes = this.populateListUpdates('substitutes', substitutes),
										suggestedRelations = this.populateSuggestions(excludedSuggestions, ingredients, isEditMode);

							return ( 
								<IngredientForm onSubmit={ e => this.onSaveIngredient(e, updateIngredient, getIngredient) } autoComplete="off">
									<div className="top">
										<div className="left">
											{/* Name */}
						    			<Input
						    				className="name"
												defaultValue={ name }
						    				isEditMode={ isEditMode }
						  					isLabelDisplayed={ false }
												isRequiredField={ true }
												name={ "name" }
						  					onChange={ this.onInputChange }
						  					placeholder={ "name" }
						  					suppressWarnings={ true }
						  					value={ pending.name }
						  					warning={ warnings["name"] }
						    			/>

						    			{/* Plural */}
						    			<Input
						    				className="plural"
						    				defaultValue={ plural }
						    				isEditMode={ isEditMode }
						  					isLabelDisplayed={ false }
						  					isPluralSuggestEnabled={ true }
												name={ "plural" }
						  					onChange={ this.onInputChange }
						  					onValidation={ this.onValidation }
						  					onSuggestPlural={ e => this.onSuggestPlural(e, name) }
						  					placeholder={ "plural" }
						  					suppressWarnings={ true }
						  					value={ pending.plural }
						  					warning={ warnings["plural"] } 
						    			/>
						    		</div>

										<div className="right">
						    			{/* Properties */}
						    			<CheckboxGroup
						  					checkboxes={ (isEditMode && pending.hasOwnProperty('properties')) ? pending.properties : properties }
						    				className={ "properties" }
						    				isEditMode={ isEditMode }
						    				key={ `card_properties_${ id }` }
						    				name="properties"
						  					onChange={ e => this.onCheckboxChange(e, 'properties', properties) }
						  					onKeyDown={ e => this.onCheckboxKeyDown(e, 'properties', properties) }
											/>

						    			{/* Is Composed Ingredient */}
											<CheckboxGroup
						  					checkboxes={ { "Is Composed Ingredient?": (isEditMode && pending.hasOwnProperty('isComposedIngredient')) ? pending.isComposedIngredient : isComposedIngredient } }
						    				className={ "isComposedIngredient" }
						    				isEditMode={ isEditMode }
						    				key={ `card_isComposed_${ id }` }
						    				name="isComposedIngredient"
						  					onChange={ e => this.onCheckboxChange(e, 'isComposedIngredient', isComposedIngredient) }
						  					onKeyDown={ e => this.onCheckboxKeyDown(e, 'isComposedIngredient', isComposedIngredient) }
											/>
										</div>
									</div>

									<div className="middle">
										<div className="left">
											{/* Alternate Names */}
						    			<List
						    				className="altNames"
						    				defaultValues={ alternateNames }
						    				isEditMode={ isEditMode }
						    				isPluralSuggestEnabled={ true }
						    				isRemoveable={ true }
												label={ "Alternate Names" }
						  					loading={ false }
												name={ "alternateNames" }
						  					onListChange={ this.onListChange }
						  					onSuggestPlural={ this.onSuggestPlural }
						  					onValidation={ this.onValidation }
						  					placeholder={ "alternate name" }
												required={ false }
						  					showSuggestions={ false }
						  					suppressWarnings={ true }
						  					warning={ warnings["alternateNames"] } 
						  					values={ pending.alternateNames }
						  					validate={ this.validate }
						    			/>

						    			{/* Related Ingredients */}
						    			<List
						    				className="related"
						    				defaultValues={ relatedIngredients }
						    				excludedSuggestions={ excludedSuggestions }
						    				isEditMode={ isEditMode }
						    				isRemoveable={ true }
						    				isSuggestionEnabled={ true }
												label={ "Related Ingredients" }
						  					loading={ false }
												name={ "relatedIngredients" }
						  					onListChange={ this.onListChange }
						  					placeholder={ "related ingredient" }
												required={ false }
						  					showSuggestions={ true }
						  					suggestionPool={ ingredients }
						  					type={ "link" }
						  					values={ pendingRelatedIngredients }
						    			/>

											{/* Substitutes */}
						    			<List
						    				defaultValues={ substitutes }
						    				className="substitutes"
						    				excludedSuggestions={ excludedSuggestions }
						    				isEditMode={ isEditMode }
						    				isRemoveable={ true }
						    				isSuggestionEnabled={ true }
												label={ "Substitutes" }
						  					loading={ false }
												name={ "substitutes" }
						  					onListChange={ this.onListChange }
						  					placeholder={ "substitute" }
												required={ false }
						  					showSuggestions={ true }
						  					suggestionPool={ ingredients }
						  					type={ "link" }
						  					values={ pendingSubstitutes }
						    			/>
										</div>

										<div className="right">
											{/* References */}
											<List
						    				className="references"
						  					defaultValues={ references }
						    				isEditMode={ false }
												label={ "References" }
						  					loading={ false }
												name={ "references" }
						  					type={ "link" }
						    			/>

						    			{/* Suggested Relations */}
						    			<List
						    				className="suggestedRelations"
						  					defaultValues={ suggestedRelations }
						    				isEditMode={ false }
												label={ "Suggestion Relations" }
						  					loading={ false }
						  					onListItemClick={ this.onSuggestedRelationClick }
												name={ "suggestedRelations" }
						  					type={ "suggestion" }
						    			/>
										</div>
									</div>

									<div className="bottom">
										{
											(!isEditMode)
												? <Button
										  			className="edit"
										  			icon={ <FontAwesomeIcon icon={ faEdit } /> }
										  			label="Edit"
										  			onClick={ e => this.onToggleEditMode(e) }
										  		/>
										  	: <React.Fragment>
										  			<div className="left">
										  				{/* TODO
										  				<Button
												  			className="merge"
												  			onClick={ e => e.preventDefault() }
												  			label="Merge Ingredient"
												  		/> */}
												  		
												  		{/* TODO
												  		<Button
												  			className="parent"
												  			onClick={ e => e.preventDefault() }
												  			label="Assign Parent"
												  		/> */}

												  		{/* TODO
												  		<Button
												  			className="parsingError"
												  			onClick={ e => e.preventDefault() }
												  			label="Parsing Error" 
												  		/>*/}
										  			</div>

										  			<div className="right">
										  			  {/* Validation Warnings */}
															{/* TODO cleanup */
																Object.entries(warnings).map(([ key, value ]) => (
																	<div className="warning" key={ `warning_${ key }` }>{ value }</div>
																))
															}

										  				<Button
												  			className="cancel"
												  			onClick={ e => this.onCancelClick(e) }
												  			label="Cancel"
												  		/>

												  		<Button
												  			className="save"
												  			label="Save"
												  			type="submit"
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
		currentIngredientID: null,
		ingredients: [],
		isCardEnabeld: false,
		isExpanded: true,
		label: "All Ingredients",
		message: "Loading..."
	},
	view: 'all',
	ingredients: [],
};

IngredientCard.propTypes = {
	container: PropTypes.object,
	currentIngredientID: PropTypes.string.isRequired,
	view: PropTypes.string,
	ingredients: PropTypes.array,
	localState: PropTypes.object,
	populateContainers: PropTypes.object,
	refreshContainers: PropTypes.func,
	updateContainer: PropTypes.func,
};

export default IngredientCard;