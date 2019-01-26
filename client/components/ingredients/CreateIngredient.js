import { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Button from '../form/Button';
import CheckboxGroup from '../form/CheckboxGroup';
import ErrorMessage from '../ErrorMessage';
import Input from '../form/Input';
import List from '../form/List';

const CREATE_INGREDIENT_MUTATION = gql`
  mutation CREATE_INGREDIENT_MUTATION(
		$name: String!
		$plural: String
		$parentID: ID
		$parentName: String
		$properties: PropertyCreateInput!
		$alternateNames: [ String ]!
		$relatedIngredients: [ ID ]!
		$substitutes: [ ID ]!
		$references: [ ID ]!
		$isValidated: Boolean!
		$isComposedIngredient: Boolean!
  ) {
    createIngredient(
      name: $name
      plural: $plural
      parentID: $parentID
      parentName: $parentName
      properties: $properties
      alternateNames: $alternateNames
      relatedIngredients: $relatedIngredients
      substitutes: $substitutes
      references: $references
      isValidated: $isValidated
      isComposedIngredient: $isComposedIngredient
    ) {
    	id
      name
    }
  }
`;

const IngredientForm = styled.form`
	position: relative;
	display: flex;
	flex-direction: column;
	flex-flow: column !important;

	fieldset {
		position: relative;
		margin: 0 0 26px;
		flex-basis: 100%;

		label {
			font-size: .875em;
	  	font-weight: 600;
	  	color: #222;
		}

		input:checked {
			+ label::after { top: 2px; }
		}
	}

	.create {
		span.highlight, span.warning {
		  top: 47px;
		}
	}

	fieldset.plural {
		height: 40px;

		label {
			display: block;
			margin-bottom: 4px;
		}

		span.highlight, span.warning {
		  top: 45px;
		}
	}

	.properties > .checkbox > label::after {
		top: 1px;
	}

	button {
		background: ${ props => props.theme.altGreen };
		border: 0;
		border-radius: 5px;
		padding: 10px 20px;
		color: white;
		text-transform: uppercase;
		font-weight: 600;
		font-size: 1.025em;
		cursor: pointer;

		&:disabled {
		  background: #ddd;
		  cursor: not-allowed;
		}
	}
`;

class CreateIngredient extends Component {
	constructor(props) {
    super(props);

    this.state = {
			name: '',
			plural: '',
			parentID: null,
			parentName: '',
			properties: {
				meat: false,
			  poultry: false,
			  fish: false,
			  dairy: false,
			  soy: false,
			  gluten: false
			},
			alternateNames: [],
			relatedIngredients: [],
			substitutes: [],
			references: [],
			isValidated: false,
			isComposedIngredient: false,

			warnings: {
				name: '',
				plural: '',
				alternateNames: '', // TODO
			}
		};

    this.nameInput = React.createRef();
  }

  componentDidMount() {
  	this.nameInput.current.textInput.current.focus();
  }

 	// TODO strip out warnings from state
	createIngredient = async (e, mutation) => {
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
			// clean up complex list structures so that we're only feeding an array of IDs
			let relatedIngredients = [ ...this.state.relatedIngredients ];
			relatedIngredients = relatedIngredients.map(r => r.id);

			let substitutes = [ ...this.state.substitutes ];
			substitutes = substitutes.map(r => r.id);

			let references = [ ...this.state.references ];
			references = references.map(r => r.id);

			// override the complex lists on the mutation
			const res = await mutation({ variables: { relatedIngredients, substitutes, references }});

			this.nameInput.current.textInput.current.focus();

			this.setState({
				name: '',
				plural: '',
				parentID: null,
				parentName: '',
				properties: {
					meat: false,
				  poultry: false,
				  fish: false,
				  dairy: false,
				  soy: false,
				  gluten: false
				},
				alternateNames: [],
				relatedIngredients: [],
				substitutes: [],
				references: [],
				isValidated: false,
				isComposedIngredient: false,

				warnings: {
					name: '',
					plural: '',
					alternateNames: '', // TODO
				}
			}, this.props.refreshContainers(e, this.props.localState, this.props.populateContainers, this.props.ingredientCounts));
		}
	}

	onCreateCheckboxChange = (e, fieldName) => {
		let properties = { ...this.state.properties };
		let { isValidated, isComposedIngredient } = this.state;

		if (fieldName === 'properties') {
	  	Object.entries(properties).forEach(([key, value]) => {
	  		if (key === e.target.value) {
	  			properties[key] = !value;
	  		}
	  	});
	  } else if (fieldName === 'isValidated') {
	  	isValidated = !isValidated;
	  } else if (fieldName === 'isComposedIngredient') {
	  	isComposedIngredient = !isComposedIngredient;
	  }

  	this.setState({
  		isComposedIngredient,
  		isValidated,
  		properties
  	});
  }

  onCreateCheckboxKeyDown = (e, fieldName) => {
  	// prevent form submission when checking checkboxes with the return key
  	if (e.key === 'Enter') {
  		e.preventDefault();
  		this.onCreateCheckboxChange(e, fieldName);
  	}
  }

	onInputChange = (e) => {
		const { name, value } = e.target;

		this.setState({
			[name]: value,
		}, this.onValidation(name, value));
	}

	onListChange = (value, listName, toRemove = false) => {
		// determine if this entry is valid
		const warning = this.validate(value);

		if (!warning) {
			let currentList = [ ...this.state[listName] ];
			const index = currentList.indexOf(value);

			if (toRemove && index > -1) {
				currentList.splice(index, 1);
			} else if (index === -1) {
				currentList.push(value);
			}

			this.setState({
				[listName]: currentList 
			});
		} else {
			// clear out validation if we hit return on an invalid value
			this.onValidation(listName, '');
		}
	}

  // TODO
  onListItemClick = (e, item) => {
  }

  onSelectParent = (suggestion) => {
  	const parentID = suggestion.id;
  	const parentName = suggestion.name;

  	this.setState({
  		parentID,
  		parentName
  	});
  }

  onSuggestPlural = (e) => {
  	e.preventDefault();

  	const { name } = this.state;
  	const plural = (name) ? pluralize(name) : '';

  	this.setState({
  		plural
  	}, this.onValidation('plural', plural));
  }

  onValidation = (fieldName, value) => {
  	let warnings = { ...this.state.warnings };

		if (warnings.hasOwnProperty(fieldName)) {
			warnings[fieldName] = this.validate(value);

			this.setState({
				warnings
			});
		}
  }

  validate = (value) => {
  	const { ingredients } = this.props;

  	if (ingredients && value) {
	  	const existing = ingredients.find(i => (i.name === value) || (i.plural === value) || (~i.alternateNames.indexOf(value)));
			return (existing) ? `The ingredient ${ value } already exists!` : '';
		}

		return '';
  }

	render() {
		const { alternateNames, isComposedIngredient, isValidated, name, parentID, parentName, plural, properties, relatedIngredients, substitutes, warnings } = this.state;
		const { ingredients } = this.props;
		let containsWarnings = false;

		console.warn(`create ${ ingredients.length || 0 }`);

		return (
			<Mutation mutation={ CREATE_INGREDIENT_MUTATION } variables={ this.state }>
    		{
    			(createIngredient, { loading, error, data }) => {
						if (error) return <ErrorMessage error={ error } />;

						// determine if we have any warnings
						for (let [ key, value ] of Object.entries(warnings)) {
							containsWarnings = (value) ? true : false;
						}

						return (
							<IngredientForm onSubmit={ e => this.createIngredient(e, createIngredient) } autoComplete="off">
								{/* Name */}
			    			<Input
			    				className="create name"
			  					isLabelDisplayed={ true }
									isRequiredField={ true }
									label={ "Name" }
									name={ "name" }
			  					onChange={ this.onInputChange }
			  					onValidation={ this.onValidation }
			  					placeholder={ "fuji apple" }
			  					ref={ this.nameInput } 
			  					value={ name }
			  					tabIndex={ 1 }
			  					warning={ warnings["name"] }
			    			/>

								{/* Plural */}
			    			<Input
			    				className="create plural"
			  					isLabelDisplayed={ true }
			  					isPluralSuggestEnabled={ true }
									label={ "Plural" }
									name={ "plural" }
			  					onChange={ this.onInputChange }
			  					onValidation={ this.onValidation }
			  					onSuggestPlural={ this.onSuggestPlural }
			  					placeholder={ "fuji apples" }
			  					value={ plural }
			  					tabIndex={ 2 }
			  					warning={ warnings["plural"] }
			    			/>

								{/* Parent Ingredient */}
								<Input
									className="create parent"
			  					isLabelDisplayed={ true }
			  					isSuggestionEnabled={ true }
									label={ "Parent Ingredient" }
									name={ "parentName" }
			  					onChange={ this.onInputChange }
			  					onValidation={ this.onValidation }
			  					onSubmit={ this.onSelectParent }
			  					placeholder={ "apple" }
			  					suggestionPool={ ingredients }
			  					tabIndex={ 3 }
			  					value={ parentName }
			    			/>

								{/* Properties */}
			    			<CheckboxGroup
			  					checkboxes={ properties }
			    				className={ "properties" }
			    				name="properties"
			    				key={ `create_properties` }
			  					onChange={ e => this.onCreateCheckboxChange(e, 'properties') }
			  					onKeyDown={ e => this.onCreateCheckboxKeyDown(e, 'properties') }
								/>

								{/* Alternate Names */}
			    			<List
			    				allowDelete={ true }
			    				className="altNames"
									label={ "Alternate Names" }
			  					list={ alternateNames }
			  					loading={ false }
									name={ "alternateNames" }
			  					onListChange={ this.onListChange }
			  					onValidation={ this.onValidation }
			  					placeholder={ "fuji" }
									required={ false }
			  					showSuggestions={ false }
			  					type={ "static" }
			  					warning={ warnings["alternateNames"] }
			    			/>

								{/* Related Ingredients */}
			    			<List
			    				allowDelete={ true }
			    				className="related"
			    				isSuggestionEnabled={ true }
									label={ "Related Ingredients" }
			  					list={ relatedIngredients }
			  					loading={ false }
									name={ "relatedIngredients" }
			  					onListChange={ this.onListChange }
			  					placeholder={ "red apple" }
									required={ false }
			  					showSuggestions={ true }
			  					suggestionPool={ ingredients }
			  					type={ "static" }
			    			/>

								{/* Substitutes */}
			    			<List
			    				allowDelete={ true }
			    				className="substitutes"
			    				isSuggestionEnabled={ true }
									label={ "Substitutes" }
			  					list={ substitutes }
			  					loading={ false }
									name={ "substitutes" }
			  					onListChange={ this.onListChange }
			  					placeholder={ "red apple" }
									required={ false }
			  					showSuggestions={ true }
			  					suggestionPool={ ingredients }
			  					type={ "static" }
			    			/>

								{/* Is Validated */}
								<CheckboxGroup
			  					checkboxes={ { "Is Valid Ingredient?": isValidated } }
			    				className={ "isValidated" }
			    				name="isValidated"
			    				key={ `create_isValidated` }
			  					onChange={ e => this.onCreateCheckboxChange(e, 'isValidated') }
			  					onKeyDown={ e => this.onCreateCheckboxKeyDown(e, 'isValidated') }
								/>

								{/* Is Composed Ingredient */}
								<CheckboxGroup
			  					checkboxes={ { "Is Composed Ingredient?": isComposedIngredient } }
			    				className={ "isComposedIngredient" }
			    				name="isComposedIngredient"
			    				key={ `create_isComposed` }
			  					onChange={ e => this.onCreateCheckboxChange(e, 'isComposedIngredient') }
			  					onKeyDown={ e => this.onCreateCheckboxKeyDown(e, 'isComposedIngredient') }
								/>

								{/* Add Button */}
			    			<Button disabled={ containsWarnings } label="Add Ingredient" type="submit" />
						</IngredientForm>
						);
					}
  			}
  		</Mutation>
		);		
	}
}

CreateIngredient.defaultProps = {
	ingredients: [],
	refreshContainers: () => {}
};

CreateIngredient.propTypes = {
	ingredientCounts: PropTypes.object,
	ingredients: PropTypes.array,
	localState: PropTypes.object,
	populateContainers: PropTypes.object,
	refreshContainers: PropTypes.func,
};

export default CreateIngredient;