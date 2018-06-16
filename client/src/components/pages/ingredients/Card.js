import axios from 'axios';
import React, { Component } from 'react';
import { NotificationManager } from 'react-notifications';

import Button from '../../form/Button';
import CheckboxGroup from '../../form/CheckboxGroup';
import List from '../../form/List';
import Modal from '../../form/Modal';
import StylizedInput from '../../form/StylizedInput';

import { clone } from '../../../lib/util';
import levenshtein from 'fast-levenshtein';
import pluralize from 'pluralize';

import './Card.css';

class Card extends Component {
	constructor(props) {
		super(props);

		this.state = {
			restore: null, // ing backup
			ingredient: null,
			isEditMode: false,
			isModalEnabled: false,
			warnings: [],
			modal: {
				label: '',
				title: '',
				type: null,
				values: {}
			}
		};

		this._source = axios.CancelToken.source();

		this.onButtonClick = this.onButtonClick.bind(this);
		this.onCheckboxChange = this.onCheckboxChange.bind(this);
		this.onNameChange = this.onNameChange.bind(this);
		this.onSuggestPlural = this.onSuggestPlural.bind(this);
		this.saveIngredient = this.saveIngredient.bind(this);
		this.updateList = this.updateList.bind(this);
	}

	componentWillReceiveProps(props) {
		this.setState({
			ingredient: clone(props.ingredient)
		}, this.getIngredient(props.ingredient.ingredientID));
  }

  componentDidMount() {
  	this.setState({
			ingredient: clone(this.props.ingredient)
		}, this.getIngredient(this.props.ingredient.ingredientID));
  }

  componentWillUnmount() {
    this._source.cancel('Cancelling request due to unmount.');
	}

  getIngredient(ingredientID) {
  	const { isEditMode } = this.props;

  	axios.get(`/ingredients/ingredientID/${ingredientID}`, { cancelToken: this._source.token })
      .then(res => {
      	this.setState({
      		restore: res.data.ingredient,
      		ingredient: res.data.ingredient,
      		isEditMode,
					isModalEnabled: false,
					modalTitle: '',
		    	modalType: null,
		    	warnings: []
      	});
      })
      .catch(err => {
      	NotificationManager.error('', `Could not get ingredient ${ingredientID}`, 3000);
      });
  }

  onButtonClick(e, type = null, subtype = null) {
  	e.preventDefault();
		const ingredient = clone(this.state.ingredient);
		const modal = clone(this.state.modal);

  	switch(type) {
  		case "edit":
  			this.toggleEditMode();
		  	break;
		  case "error": // does this ever get called?
		  	const associated = (modal.hasOwnProperty('values') && modal.values.hasOwnProperty('associated'))
		  																? modal.values.associated : [];
		  	const errorType = (modal.hasOwnProperty('values') && modal.values.hasOwnProperty('type'))
		  																? modal.values.type : null;
		  	const error = { ingredient, associated, type: errorType };

		  	this.saveIngredient(null, error);
		  	break;
		 	case "merge":
		 		break;
  		case "modal":
  			this.toggleModal(subtype);
		  	break;
		  case "parent":
		  	const parentIngredient = (modal.hasOwnProperty('values') && modal.values.hasOwnProperty('parentIngredient'))
		  																? modal.values.parentIngredient : null;
		  	this.saveIngredient(parentIngredient);
		  	break;
  		case "save":
  			this.saveIngredient();
  			break;
  		default:
  			break;
  	}
  }

  onCheckboxChange(e) {
		let ingredient = clone(this.state.ingredient);

  	if (ingredient && ingredient.properties) {
	  	// figure out which property was checked/unchecked
	  	Object.entries(ingredient.properties).forEach(([key, value]) => {
	  		if (key === e.target.value) {
	  			ingredient.properties[key] = !value;
	  		}
	  	});
	  }

  	this.setState({
  		ingredient
  	});
  }

  onNameChange(e, fieldType) {
  	e.preventDefault();

  	let ingredient = clone(this.state.ingredient);
  	let message = '';
  	let warnings = [ ...this.state.warnings ];

  	const ingredients = clone(this.props.ingredients);
  	const updatedName = e.target.value;
  	const warning = warnings.find(w => w.type === fieldType);
  	const warningIndex = warnings.indexOf(warning);

  	// update input field
  	ingredient.name = (fieldType === 'name') ? updatedName : ingredient.name;
  	ingredient.plural = (fieldType === 'plural') ? updatedName : ingredient.plural;

  	// check if the ingredient name is in use
  	const matches = ingredients
			// exclude the current ingredient
  		.filter(i => i.ingredientID !== ingredient.ingredientID)
  		.find(i => ((updatedName.trim().length > 0)
  			&& ( // and find any matches...
	  			(i.hasOwnProperty('name') && i.name === updatedName.trim()) // on name
	  			|| (i.hasOwnProperty('plural') && i.plural === updatedName.trim()) // on plural
	  			|| (i.hasOwnProperty('alternateNames') && i.alternateNames.find(n => n === updatedName.trim())) // on any alternative names
	  			|| (i.hasOwnProperty('parsingExpressions') && i.parsingExpressions.find(n => n === updatedName.trim())) // on any parsing expressions
		  	)
  		));

  	if (matches) {
  		message = `The ${(fieldType === 'name') ? 'name' : 'plural name'} "${updatedName}" is alredy in use! Saving will merge these records!`;
  	}

  	// if we found this name used on another ingredient and it's the first warning of this type
  	// then add to the warnings list
		if (matches && !~warningIndex) {
			warnings.push({ type: fieldType, message });
		} else if (matches) {
			// otherwise just update the existing warning message
			warnings[warningIndex].message = message;
		} else {
			// if we don't have any validation errors on this field clear out any related warnings
			warnings.splice(warningIndex, 1);
		}

  	this.setState({
  		ingredient,
  		warnings
  	});
  }

  onSuggestPlural(e) {
  	e.preventDefault();

  	let ingredient = clone(this.state.ingredient);

  	if (ingredient && ingredient.name) {
			ingredient.plural = pluralize(ingredient.name);

			this.setState({
				ingredient
			});
		}
  }

  saveIngredient(parent = null, error = null) {
  	console.warn('saveIngredient');
  	const ingredient = clone(this.state.ingredient);
  	ingredient.validated = true;

  	axios.post('/ingredients/save', {
	    ingredient,
	    parent,
	    error
	  })
	  .then(res => {
	  	console.log(res.data);
	  	const status = res.data.status;
	    NotificationManager.success('', `${status}.`, 3000);
			this.setState({
				ingredient: res.data.ingredient,
				restore: res.data.ingredient,
				isModalEnabled: false,
				warnings: [],
				modal: {
					label: '',
					title: '',
					type: null,
					values: {}
				}
			}, this.props.refresh(res.data.ingredient));
	  })
	  .catch(err => {
	    console.log(err);
	    NotificationManager.error('', `An error occurred while attempting to save "${ingredient.name}.`, 30000);
	  });
  }

  toggleEditMode() {
  	const { isEditMode } = this.state;
  	this.setState({
  		ingredient: clone(this.state.restore),
  		isEditMode: !isEditMode
  	});
  }

  toggleModal(type) {
  	const { isModalEnabled } = this.state;
  	const modal = clone(this.state.modal);

		switch(type) {
			case "error":
				modal.label = 'Save';
				modal.title = 'Select an Error Type';
				modal.type = 'error';
				modal.values = {
					associated: [],
					type: null // [ 'data', 'semantic', 'instruction', 'equipment' ]
				};
				break;
			case "merge":
				// TODO
				break;
			case "parent":
				// TODO
				break;
			default: // cancel
				modal.label = '';
				modal.title = '';
				modal.type = null;
				modal.values = {};
				break;	
		}

  	this.setState({
  		isModalEnabled: !isModalEnabled,
  		modal
  	});
  }

  updateList(e, code, value) {
  	let ingredient = clone(this.state.ingredient);

  	switch(code) {
  		case 'alt':
  			ingredient.alternateNames.push(value);
  			break;
  		case 'rel':
  			// the back-end will fill in the most up-to-date ID for us
  			ingredient.relatedIngredients.push({ ingredientID: null, name: value });
  			break
  		case 'exp':
  			ingredient.parsingExpressions.push(value);
  			break;
  		case 'sub':
  		// the back-end will fill in the most up-to-date ID for us
  			ingredient.substitutes.push({ ingredientID: null, name: value });
  			break;
  		default:
  			break;
  	}

  	this.setState({
  		ingredient
  	});
  }

  renderButtons(isEditMode, warnings) {
		if (!isEditMode) {
			return (
				<Button
	  			className="edit"
	  			onClick={ e => this.onButtonClick(e, 'edit') }
	  			label="Edit"
	  		/>
			);
		} else {
			return (
				<React.Fragment>
	  			<div className="left">
	  				<Button
			  			className="merge"
			  			onClick={ e => this.onButtonClick(e, 'modal', 'merge') }
			  			label="Merge Ingredient"
			  		/>
			  		<Button
			  			className="parent"
			  			onClick={ e => this.onButtonClick(e, 'modal', 'parent') }
			  			label="Assign Parent"
			  		/>
			  		<Button
			  			className="parsingError"
			  			onClick={ e => this.onButtonClick(e, 'modal', 'error') }
			  			label="Parsing Error"
			  		/>
	  			</div>
	  			<div className="right">
	  			  {/* Validation Warnings */}
						{ this.renderWarnings(warnings) }

	  				<Button
			  			className="cancel"
			  			onClick={ e => this.onButtonClick(e, 'edit') }
			  			label="Cancel"
			  		/>
			  		<Button
			  			className="save"
			  			onClick={ e => this.onButtonClick(e, 'save') }
			  			label="Save"
			  		/>
	  			</div>
	  		</React.Fragment>
			);
		}
	}

	renderReferences(ingredient) {
		// TODO how am i loosing references when i switch into edit mode?
		if (ingredient && ingredient.hasOwnProperty('references') && ingredient.references.length > 0) {
  		return (
  			<div className="field references">
					<label>{ `${(ingredient && ingredient.references) ? ingredient.references.length : 0} Reference${(ingredient && (ingredient.references.length === 1)) ? '' : 's' }`}</label>
					<ul>
					{
						ingredient.references.map((ref, index) => <li key={ ref[1] + index }>{ ref[0] }</li>)
					}
					</ul>
				</div>
  		);
  	} return null;
  }

	renderSuggestions(ingredient, isEditMode) {
		const ingredients = clone(this.props.ingredients);

		if (ingredient && isEditMode) {
	  	let related = [];
  		const name = ingredient.name; // 'active dry yeast'
  		const nameArray = name.split(' '); // ['active', 'dry', 'yeast']
  		// consider using same word list as grammar
  		const excluded = ['a', 'from', 'the', 'you', 'be', 'for', 'with', 'plus']; // TODO expand

	  	const populateRelated = (i, related) => {
				if (!related.find(ing => ing.name.includes(i))) {
					// yeah... idk if this is even the west weight...
					// TODO research this a bit more
					related.push({ name: i, score: levenshtein.get(name, i) });
				}
			};

  		// and for each word in the ingredient's name see if its used elsewhere
  		for (let w in nameArray) {
  			const word = nameArray[w]; // 'yeast'

  			if (!excluded.includes(word)) {
	  			ingredients.filter(i => i.ingredientID !== ingredient.ingredientID)
	  				.filter(i => (i.name && i.name.indexOf(word) > -1)
	  					|| (i.plural && i.plural.indexOf(word) > -1)
	  					|| (i.alternateNames && i.alternateNames.find(n => n.indexOf(word) > -1))
	  					|| (i.parsingExpressions && i.parsingExpressions.find(n => n.indexOf(word) > -1))
	  					)
	  				.map(i => i.name)
	  				// eslint-disable-next-line
	  				.map(i => populateRelated(i, related));
	  		}
  		}

	  	related = related.filter(i => i.score > .25 && i.score !== 1);
	  	related = related.sort((a, b) => ((a.score < b.score) ? -1 : (a.score > b.score) ? 1 : 0) * 1);

	  	if (related.length > 0) {
		  	return (
		  		<div className="field related">
			  		<label>Suggested Relations</label>
						<ul>
							{
								related.map((ing, index) => <li key={ index + '_rel_' + ing.name }>{ ing.name } - { ing.score }</li>)
							}
						</ul>
					</div>
		  	);
		  } return null;
		} return null;
	}

  renderWarnings(warnings) {
		// TODO adjust message when we have multiple errors going on
		if (warnings && warnings.length > 0) {
			return (
				<ul className="warnings">
					{
						warnings.map((warning, index) => <li key={ `warning_${index}` }>{ warning.message }</li>)
					}
				</ul>
			);
		}
	}

	render() {
		const { isEditMode, isModalEnabled, warnings } = this.state;
		const ingredient = clone(this.state.ingredient);
		const ingredients = clone(this.props.ingredients);
		const modal = clone(this.state.modal);

  	const isColumnCollapsed = !isEditMode && ingredient
	  	&& (ingredient.hasOwnProperty('alternateNames') && ingredient.alternateNames.length === 0)
	  	&& (ingredient.hasOwnProperty('parsingExpressions') && ingredient.parsingExpressions.length === 0)
			&& (ingredient.hasOwnProperty('relatedIngredients') && ingredient.relatedIngredients.length === 0)
	  	&& (ingredient.hasOwnProperty('substitutes') && ingredient.substitutes.length === 0);
  	const properties = (ingredient && ingredient.properties) ? Object.entries(ingredient.properties).map(i => i[0]) : [];
  	const checkedProperties = (ingredient && ingredient.properties) ? Object.entries(ingredient.properties).filter(i => i[1]).map(i => i[0]) : [];

		return (
			<form autoComplete="off" className="card" onClick={ e => e.stopPropagation() }>
  			{/* Modal Windows */}
  			{ (isModalEnabled)
  					? <Modal
  							ingredient={ ingredient }
  							ingredients={ ingredients }
  							modal={ modal }
  							saveIngredient={ this.saveIngredient }
  						/>
  					: null
  			}
  			{/* Top Card Elements */}
  			<div className="top">
  				<div className="field stacked" ref={ el => this.cardStackedInputs = el }>
						{/* Name */}
						<StylizedInput
							className={ "name" }
	  					isEditMode={ isEditMode }
							label={ "name" }
	  					onBlur={ () => {} }
	  					onChange={ this.onNameChange }
	  					onKeyDown={ e => { } }
	  					passesValidation={ (warnings.find(w => w.type === 'name')) ? false : true }
	  					placeholder={ "ingredient name" }
							placeholderWidth={ 140 }
	  					value={ (ingredient && ingredient.name) ? ingredient.name : "" }
	  				/>

						{/* Plural */}
						<StylizedInput
							className={ "plural" }
							ingredient={ ingredient }
							isEditMode={ isEditMode }
							label={ "plural" }
							onBlur={ () => {} }
	  					onChange={ this.onNameChange }
	  					onSuggestPlural={ this.onSuggestPlural }
	  					passesValidation={ (warnings.find(w => w.type === 'plural')) ? false : true }
	  					placeholder={ "plural name" }
							placeholderWidth={ 80 }
	  					onKeyDown={ e => {  } }
	  					value={ (ingredient && ingredient.plural) ? ingredient.plural : "" }
						/>
					</div>

					{/* Properties */}
					<div className="field properties" ref={ el => this.cardProperties = el }>
						<CheckboxGroup
	  					checkedOptions={ checkedProperties }
	  					isEditMode={ isEditMode }
	  					onChange={ this.onCheckboxChange }
	  					options={ properties }
	  					type={ "checkbox" }
						/>
					</div>
  			</div>

  			{/* Left Card Elements */}
  			<div className={ `left ${(isColumnCollapsed) ? 'collapse' : ''}` }>
  				{/* Alternate Names */}
					<List
						code={ "alt" }
						currentIngredient={ ingredient }
						ingredients={ ingredients }
						isEditMode={ isEditMode }
						key={ "alt" }
						label={ "Alternate Names" }
						list={ (ingredient && ingredient.alternateNames) ? ingredient.alternateNames : [] }
						updateList={ this.updateList }
					/>

					{/* Parsing Expressions */}
					<List
						code={ "exp" }
						currentIngredient={ ingredient }
						ingredients={ ingredients }
						isEditMode={ isEditMode }
						key={ "exp" }
						label={ "Parsing Expressions" }
						list={ (ingredient && ingredient.parsingExpressions) ? ingredient.parsingExpressions : [] }
						updateList={ this.updateList }
					/>

					{/* Related Ingredients */}
					<List
						code={ "rel" }
						currentIngredient={ ingredient }
						ingredients={ ingredients }
						isEditMode={ isEditMode }
						key={ "rel" }
						label={ "Related Ingredients" }
						list={ (ingredient && ingredient.relatedIngredients) ? ingredient.relatedIngredients : [] }
						updateList={ this.updateList }
					/>

					{/* Substitutes */}
					<List
						code={ "sub" }
						currentIngredient={ ingredient }
						ingredients={ ingredients }
						isEditMode={ isEditMode }
						key={ "sub" }
						label={ "Substitutes" }
						list={ (ingredient && ingredient.substitutes) ? ingredient.substitutes : [] }
						updateList={ this.updateList }
					/>
  			</div>

				{/* Right Card Elements */}
  			<div className="right">
  				{/* References */}
  				{ this.renderReferences(ingredient) }

					{/* Possible Relations */}
					{ this.renderSuggestions(ingredient, isEditMode) }
  			</div>

  			{/* Bottom Card Elements */}
  			<div className="bottom">
					{/* Edit Mode Actions & Validation Warnings */}
					{ this.renderButtons(isEditMode, warnings) }
  			</div>
  		</form>
		);
	}
}

export default Card;