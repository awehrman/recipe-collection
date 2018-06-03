import React, { Component } from 'react';

import './Card.css';

class Card extends Component {
	constructor(props) {
		super(props);

		this.state = {
		};
	}

	render() {
		const { ingredient, isEditMode, isModalMode, modal, warnings } = this.state;
  	const { container, ingredients } = this.props;

  	const isColumnCollapsed = !isEditMode && ingredient
	  		&& (ingredient.alternateNames.length === 0)
	  		&& (ingredient.parsingExpressions.length === 0)
				&& (ingredient.relatedIngredients.length === 0)
	  		&& (ingredient.substitutes.length === 0);
  	const properties = (ingredient && ingredient.properties) ? Object.entries(ingredient.properties).map(i => i[0]) : [];
  	const checkedProperties = (ingredient && ingredient.properties) ? Object.entries(ingredient.properties).filter(i => i[1]).map(i => i[0]) : [];

		return (
			<form autoComplete="off" className="card" onClick={ e => e.stopPropagation() }>
  			{/* TODO Alerts */}
  			{/* Top Card Elements */}
  			<div className="top">
  				<div className="field stacked" ref={ el => this.cardStackedInputs = el }>
						{/* Name 
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
		  			*/}
		  			NAME

						{/* Plural 
						<StylizedInput
							className={ "plural" }
							icon={ "suggest" }
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
						/>*/}
						PLURAL
					</div>

					{/* Properties */}
					<div className="field properties" ref={ el => this.cardProperties = el }>
						{/*<CheckboxGroup
	  					checkedOptions={ checkedProperties }
	  					isEditMode={ isEditMode }
	  					onChange={ this.onCheckboxChange }
	  					options={ properties }
	  					type={ "checkbox" }
						/>*/}
						PROPERTIES
					</div>
  			</div>

  			{/* Left Card Elements */}
  			<div className={ `left ${(isColumnCollapsed) ? 'collapse' : ''}` }>
  				{/* Alternate Names 
					<SuggestedInputList
						updateList={ this.updateList }
						cardRef={ this.currentCard }
						code="alt"
						container={ container }
						findListItemRef={ this.props.findListItemRef }
						isEditMode={ isEditMode }
						currentIngredient={ ingredient }
						ingredients={ ingredients }
						label="Alternate Names"
						list={ (ingredient && ingredient.alternateNames) ? ingredient.alternateNames : [] }
						onLinkClick={ this.props.onLinkClick }
						updateContainerDimensions={ this.props.updateContainerDimensions }
					/>*/}
					ALT NAMES

					{/* Parsing Expressions 
					<SuggestedInputList
						updateList={ this.updateList }
						cardRef={ this.currentCard }
						code="exp"
						container={ container }
						findListItemRef={ this.props.findListItemRef }
						isEditMode={ isEditMode }
						currentIngredient={ ingredient }
						ingredients={ ingredients }
						label="Parsing Expressions"
						list={ (ingredient && ingredient.parsingExpressions) ? ingredient.parsingExpressions : [] }
						onLinkClick={ this.props.onLinkClick }
						updateContainerDimensions={ this.props.updateContainerDimensions }
					/>*/}
					PARSING EXP

					{/* Related Ingredients 
					<SuggestedInputList
						updateList={ this.updateList }
						cardRef={ this.currentCard }
						code="rel"
						container={ container }
						findListItemRef={ this.props.findListItemRef }
						isEditMode={ isEditMode }
						currentIngredient={ ingredient }
						ingredients={ ingredients }
						label="Related Ingredients"
						list={ (ingredient && ingredient.relatedIngredients) ? ingredient.relatedIngredients : [] }
						onLinkClick={ this.props.onLinkClick }
						updateContainerDimensions={ this.props.updateContainerDimensions }
					/>*/}

					{/* Substitutes 
					<SuggestedInputList
						updateList={ this.updateList }
						cardRef={ this.currentCard }
						code="sub"
						container={ container }
						findListItemRef={ this.props.findListItemRef }
						isEditMode={ isEditMode }
						currentIngredient={ ingredient }
						ingredients={ ingredients }
						label="Substitutes"
						list={ (ingredient && ingredient.substitutes) ? ingredient.substitutes : [] }
						onLinkClick={ this.props.onLinkClick }
						updateContainerDimensions={ this.props.updateContainerDimensions }
					/>*/}
					SUBSTITUTES
  			</div>

				{/* Right Card Elements */}
  			<div className="right">
  				{/* References */}
  				{/* this.renderReferences(ingredient) */}
  				References

					{/* Possible Relations */}
					{/* this.renderSuggestions(ingredient, isEditMode) */}
					Relations
  			</div>

  			{/* Bottom Card Elements */}
  			<div className="bottom">
					{/* Edit Mode Actions & Validation Warnings */}
					{/* this.renderButtons(isEditMode, warnings) */}
					Buttons
  			</div>
  		</form>
		);
	}
}

export default Card;