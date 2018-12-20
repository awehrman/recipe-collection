import { Component } from 'react';
import Link from 'next/link';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import pluralize from 'pluralize';

import Button from '../form/Button';
import CheckboxGroup from '../form/CheckboxGroup';
import ErrorMessage from '../ErrorMessage';
import Input from '../form/Input';
import List from '../form/List';

/*
	TODO
		- confirm parent submission success
		- alternateNames
		- relatedIngredients
		- substitutes
		- references

		- additional form validation needed
			- label name as required
			- warning if existing names are used and if will trigger merge
			- warning if parent ingredient is new
		- tabbing thru fields no longer registers
		- focus styling on plural field is broken
		- add success/error messaging
		- close this component once createIngredient is called
*/

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
    ) {
    	id
      name
    }
  }
`;

const IngredientForm = styled.form`
	margin: 20px 0;

	fieldset {
		border: 0;
		border-bottom: 2px solid #ccc;
		max-width: 400px;

		label {
			display: block;
			font-size: .875em;
			padding-bottom: 4px;
			font-weight: 600;
		}
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
		margin-top: 20px;
	}

	/* TODO adjust */
	.properties, .isValidated {
		border: 0;
		padding-left: 0;
		padding-right: 0;
		color: #222;

		.checkbox {
			display: inline-block;

			& label {
		    position: relative;
		    padding-left: 20px;
		    margin-right: 16px;
		    font-weight: 400;
		    cursor: pointer;
		  }

		  & label::before {
		    display: block;
		    position: absolute;
		    top: 5px;
		    left: 0;
		    width: 11px;
		    height: 11px;
		    border-radius: 3px;
		    background-color: white;
		    border: 1px solid #bbb;
		    content: '';
		  }
		}

		.checkbox:last-of-type {
			& label {
		    padding-right: 0;
		    margin-right: 0;
		  }
		}

		input[type='checkbox'] {
			border: 1px solid green;
		  position: absolute;
		  top: 0;
		  left: 0;
		  width: 0;
		  height: 0;
		  opacity: 0;
		  pointer-events: none;
		  display: none; /* prevent the page from moving on click */

		  &:checked + label::after {
		    display: block;
		    position: absolute;
		    top: 2px;
		    left: 1px;
		    font-family: "Font Awesome 5 Pro";
		    content: "\f00c";
		    font-weight: 900;
		    color: ${ props => props.theme.altGreen };
		  }
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
			isValidated: false
		};

		this.onCheckboxChange = this.onCheckboxChange.bind(this);
		this.onValidatedChange = this.onValidatedChange.bind(this);
		this.onSuggestPlural = this.onSuggestPlural.bind(this);
		this.onSelectParent = this.onSelectParent.bind(this);
	}

	handleChange = (e) => {
		const { name, value } = e.target;

		this.setState({
			[name]: value
		});
	}

	handleListChange = (list, item, toRemove = false) => {
		let currentList = [ ...this.state[list] ];
		const index = currentList.indexOf(item);

		if (toRemove && index > -1) {
			currentList.splice(index, 1);
		} else if (index === -1) {
			currentList.push(item);
		}

		this.setState({
			[list]: currentList 
		});
	}

	onCheckboxChange(e) {
		let properties = { ...this.state.properties };

  	Object.entries(properties).forEach(([key, value]) => {
  		if (key === e.target.value) {
  			properties[key] = !value;
  		}
  	});

  	this.setState({
  		properties
  	});
  }

  onValidatedChange(e) {
  	let { isValidated } = this.state;
  	isValidated = !isValidated;

  	this.setState({
  		isValidated
  	});
  }

  onSuggestPlural(e) {
  	e.preventDefault();

  	const { name } = this.state;
  	const plural = (name) ? pluralize(name) : '';

  	this.setState({
  		plural
  	});
  }

  onSelectParent(e, suggestion) {
  	e.preventDefault();
  	const parentID = suggestion.id;
  	const parentName = suggestion.name;

  	this.setState({
  		parentID,
  		parentName
  	});
  }
 
	createIngredient = async (e, mutation) => {
		e.preventDefault();

		// clean up complex list structures so that we're only feeding an array of IDs
		let relatedIngredients = [ ...this.state.relatedIngredients ];
		relatedIngredients = relatedIngredients.map(r => r.id);

		let substitutes = [ ...this.state.substitutes ];
		substitutes = substitutes.map(r => r.id);

		let references = [ ...this.state.references ];
		references = references.map(r => r.id);

		// override the complex lists on the mutation
		const res = await mutation({ variables: { relatedIngredients, substitutes, references }});
		console.log(res);

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
			isValidated: false
		}, this.props.refreshContainers(e, this.props.populateContainers, this.props.ingredientCounts));
	}

	render() {
		const { alternateNames, isValidated, name, parentID, parentName, plural, properties, relatedIngredients, substitutes } = this.state;
		const { ingredients } = this.props;

		return (
			<Mutation mutation={ CREATE_INGREDIENT_MUTATION } variables={ this.state }>
    		{
    			(createIngredient, { loading, error, data }) => {
    				if (loading) return <p>Loading...</p>;
						if (error) return <ErrorMessage error={ error } />;

						return (
							<IngredientForm onSubmit={ e => this.createIngredient(e, createIngredient) } autoComplete="off">
			    			<Input
									label={ "Name" }
									name={ "name" }
			  					onChange={ this.handleChange }
									required={ true }
			  					placeholder={ "fuji apple" }
			  					showLabel={ true }
			  					value={ name }
			    			/>

								{/* TODO there's an issue with focus highlight on this field; may be suggestion related */}
			    			<Input
									label={ "Plural" }
									name={ "plural" }
			  					onChange={ this.handleChange }
									required={ false }
			  					placeholder={ "fuji apples" }
			  					showLabel={ true }
			  					suggestPlural={ true }
			  					onSuggestPlural={ this.onSuggestPlural }
			  					value={ plural }
			    			/>

			    			<CheckboxGroup
			    				className={ "properties" }
			  					isEditMode={ true }
			  					onChange={ this.onCheckboxChange }
			  					options={ properties }
			  					type={ "checkbox" }
								/>

								<Input
									label={ "Parent Ingredient" }
									name={ "parentName" }
			  					onChange={ this.handleChange }
									required={ false }
			  					placeholder={ "apple" }
			  					showLabel={ true }
			  					value={ parentName }
			  					showSuggestions={ true }
			  					onSelectSuggestion={ this.onSelectParent }
			  					suggestionPool={ ingredients }
			    			/>

			    			<List
			    				allowDelete={ true }
			    				isEditMode={ true }
									label={ "Alternate Names" }
			  					list={ alternateNames }
			  					loading={ false }
									name={ "alternateNames" }
			  					onListChange={ this.handleListChange }
			  					placeholder={ "fuji" }
									required={ false }
			  					showLabel={ false }
			  					showSuggestions={ false }
			  					type={ "static" }
			    			/>

			    			<List
			    				allowDelete={ true }
			    				isEditMode={ true }
									label={ "Related Ingredients" }
			  					list={ relatedIngredients }
			  					loading={ false }
									name={ "relatedIngredients" }
			  					onListChange={ this.handleListChange }
			  					placeholder={ "red apple" }
									required={ false }
			  					showLabel={ false }
			  					showSuggestions={ true }
			  					suggestionPool={ ingredients }
			  					type={ "static" }
			    			/>

			    			<List
			    				allowDelete={ true }
			    				isEditMode={ true }
									label={ "Substitutes" }
			  					list={ substitutes }
			  					loading={ false }
									name={ "substitutes" }
			  					onListChange={ this.handleListChange }
			  					placeholder={ "red apple" }
									required={ false }
			  					showLabel={ false }
			  					showSuggestions={ true }
			  					suggestionPool={ ingredients }
			  					type={ "static" }
			    			/>

								<CheckboxGroup
			    				className={ "isValidated" }
			  					isEditMode={ true }
			  					onChange={ this.onValidatedChange }
			  					options={ { "Is Valid Ingredient?": isValidated } }
			  					type={ "checkbox" }
								/>

			    			<Button type="submit" label="Add Ingredient" />
						</IngredientForm>
						);
					}
  			}
  		</Mutation>
		);		
	}
}

// TODO add PropTypes

export default CreateIngredient;