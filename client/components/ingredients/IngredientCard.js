import { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import styled from 'styled-components';

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

const CardStyles = styled.div`
	max-height: ${ props => props.theme.mobileCardHeight };
	padding: 20px;
	border-bottom: 1px solid #ddd;
	width: 100%;

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
	fieldset {
		margin-bottom: 10px;
	}

	fieldset input {
	 	border-bottom: 0;
	}

	fieldset.plural {
		height: 20px;
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
			}

			.left {
				flex: 1;
			}
		}

		.bottom {
		}
	}
`;

// TODO there is so much duplicated code between this and the create component;
// see if we can DRY this up

class IngredientCard extends Component {
	state = {
		// TODO should these be moved off into Apollo's cache?
		warnings: {
			name: '',
			plural: '',
			alternateNames: '', // TODO
		},

		isEditMode: false
	};

	componentDidMount = () => {
		//console.warn('Card - componentDidMount');
		const { currentView } = this.props;

		this.setState({
			isEditMode: (currentView === 'new') ? true : false 
		});
	}

	componentDidUpdate = (prevProps) => {
		//console.warn('Card - componentDidUpdate');
		const { currentView } = this.props;

		if (currentView !== prevProps.currentView) {
			this.setState({
				isEditMode: (currentView === 'new') ? true : false 
			});
		}
	}

	onCheckboxChange = (e, fieldName, defaultValue) => {
		console.warn('Card - onCheckboxChange');

		switch (fieldName) {
			case 'properties':
				let properties = (this.state.hasOwnProperty('properties')) ? { ...this.state.properties } : defaultValue;

				Object.entries(properties).forEach(([ key, value ]) => {
		  		if (key === e.target.value) {
		  			properties[key] = !value;
		  		}
		  	});
		  	
		  	this.setState({
		  		properties
		  	});
		  	break;

		  case 'isComposedIngredient':
		  	const isComposedIngredient = (this.state.hasOwnProperty('isComposedIngredient')) ? this.state.isComposedIngredient : defaultValue;

		  	this.setState({
		  		isComposedIngredient: !isComposedIngredient
		  	});
		  	break;

		  case 'isValidated':
		  	const isValidated = (this.state.hasOwnProperty('isValidated')) ? this.state.isValidated : defaultValue;

		  	this.setState({
		  		isValidated: !isValidated
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
		console.warn('Card - onInputChange');
		const { name, value } = e.target;

		this.setState({
			[name]: value,
		}, this.onValidation(name, value));
	}

	onListChange = (value, listName, toRemove = false, defaultValue) => {
		console.warn('Card - onListChange');
		console.log({ value, listName, toRemove });
		// determine if this entry is valid
		const warning = this.validate(value);

		if (!warning) {
			let currentList = (this.state.hasOwnProperty(listName)) ? [ ...this.state[listName] ] : defaultValue;
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

	onSuggestPlural = (e, defaultName) => {
		console.warn('Card - onSuggestPlural');
  	e.preventDefault();

  	const name = (this.state.hasOwnProperty('name')) ? this.state.name : defaultName;
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
		const { currentIngredientID, currentView, ingredients } = this.props;
		const { isEditMode, warnings } = this.state;
		
		return (
			<CardStyles>
				<Query query={ CURRENT_INGREDIENT_QUERY } variables={ { id: currentIngredientID } }>
					{
						({ data, error, loading }) => {
							if (loading) return <p>Loading...</p>;
							if (error) return <p>Error: { error.message }</p>;

							const { name, plural, properties, alternateNames, relatedIngredients, substitutes,
											isComposedIngredient, references } = data.ingredient || '';

							return ( 
								<IngredientForm onSubmit={ e => this.createIngredient(e, createIngredient) } autoComplete="off">
									<div className="top">
										<div className="left">
											{/* Name */}
						    			<Input
						    				className="name"
						    				isEditMode={ isEditMode }
						  					isLabelDisplayed={ false }
												isRequiredField={ true }
												name={ "name" }
						  					onChange={ this.onInputChange }
						  					onValidation={ this.onValidation }
						  					placeholder={ "name" }
						  					suppressWarnings={ true }
						  					value={ (isEditMode && this.state.hasOwnProperty('name')) ? this.state.name : name }
						  					warning={ warnings["name"] }
						    			/>

						    			{/* Plural */}
						    			<Input
						    				className="plural"
						    				isEditMode={ isEditMode }
						  					isLabelDisplayed={ false }
						  					isPluralSuggestEnabled={ true }
												name={ "plural" }
						  					onChange={ this.onInputChange }
						  					onValidation={ this.onValidation }
						  					onSuggestPlural={ e => this.onSuggestPlural(e, name) }
						  					placeholder={ "plural" }
						  					suppressWarnings={ true }
						  					value={ (isEditMode && this.state.hasOwnProperty('plural')) ? this.state.plural : plural }
						  					warning={ warnings["plural"] }
						    			/>
						    		</div>

										<div className="right">
						    			{/* Properties */}
						    			<CheckboxGroup
						  					checkboxes={ (isEditMode && this.state.hasOwnProperty('properties')) ? this.state.properties : properties }
						    				className={ "properties" }
						    				isEditMode={ isEditMode }
						    				name="properties"
						  					onChange={ e => this.onCheckboxChange(e, 'properties', properties) }
						  					onKeyDown={ e => this.onCheckboxKeyDown(e, 'properties', properties) }
											/>

						    			{/* Is Composed Ingredient */}
											<CheckboxGroup
						  					checkboxes={ { "Is Composed Ingredient?": (isEditMode && this.state.hasOwnProperty('isComposedIngredient')) ? this.state.isComposedIngredient : isComposedIngredient } }
						    				className={ "isComposedIngredient" }
						    				isEditMode={ isEditMode }
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
						    				allowDelete={ true }
						    				className="altNames"
						    				defaultValue={ alternateNames }
						    				isEditMode={ isEditMode }
												label={ "Alternate Names" }
						  					list={ (isEditMode && this.state.hasOwnProperty('alternateNames')) ? this.state.alternateNames : alternateNames }
						  					loading={ false }
												name={ "alternateNames" }
						  					onListChange={ this.onListChange }
						  					onValidation={ this.onValidation }
						  					placeholder={ "alternate name" }
												required={ false }
						  					showLabel={ false }
						  					showSuggestions={ false }
						  					suppressWarnings={ true }
						  					type={ "static" }
						  					warning={ warnings["alternateNames"] }
						    			/>

						    			{/* Related Ingredients */}
						    			<List
						    				allowDelete={ true }
						    				className="related"
						    				defaultValue={ relatedIngredients }
						    				isEditMode={ isEditMode }
						    				isSuggestionEnabled={ true }
												label={ "Related Ingredients" }
						  					list={ relatedIngredients }
						  					loading={ false }
												name={ "relatedIngredients" }
						  					onListChange={ this.onListChange }
						  					placeholder={ "related ingredient" }
												required={ false }
						  					showLabel={ false }
						  					showSuggestions={ true }
						  					suggestionPool={ ingredients }
						  					type={ "link" }
						    			/>

											{/* Substitutes */}
						    			<List
						    				allowDelete={ true }
						    				defaultValue={ substitutes }
						    				className="substitutes"
						    				isEditMode={ isEditMode }
						    				isSuggestionEnabled={ true }
												label={ "Substitutes" }
						  					list={ substitutes }
						  					loading={ false }
												name={ "substitutes" }
						  					onListChange={ this.onListChange }
						  					placeholder={ "substitute" }
												required={ false }
						  					showLabel={ false }
						  					showSuggestions={ true }
						  					suggestionPool={ ingredients }
						  					type={ "link" }
						    			/>
										</div>

										<div className="right">
											{/* References */}
						    			<List
						    				allowDelete={ true }
						    				className="references"
						    				isEditMode={ isEditMode }
												label={ "References" }
						  					list={ references }
						  					loading={ false }
												name={ "references" }
						  					onListChange={ this.onListChange }
						  					placeholder={ "" }
												required={ false }
						  					showLabel={ false }
						  					type={ "link" }
						    			/>

						    			{/* Suggested Relations
						    			<List
						    				allowDelete={ true }
						    				className="suggestions"
						    				isEditMode={ isEditMode }
												label={ "Suggested Relations" }
						  					list={ suggestions }
						  					loading={ false }
												name={ "suggestions" }
						  					onListChange={ this.onListChange }
						  					placeholder={ "" }
												required={ false }
						  					showLabel={ false }
						  					type={ "link" }
						    			/> */}
										</div>
									</div>

									<div className="bottom">
										{/* TODO cleanup */
											Object.entries(warnings).map(([ key, value ]) => (
												<div className="warning">{ value }</div>
											))
										}
									</div>
			    			</IngredientForm>
							);
						}
					}
				</Query>
			</CardStyles>
		);		
	}
}

IngredientCard.defaultProps = {
	currentView: 'all',
	ingredients: []
};

IngredientCard.propTypes = {
	currentIngredientID: PropTypes.string.isRequired,
	currentView: PropTypes.string,
	ingredients: PropTypes.array
};

export default IngredientCard;