import React, { Component } from 'react';

import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faPlus from '@fortawesome/fontawesome-pro-solid/faPlus';

import Button from './Button';
import Input from './Input';

import './List.css';

class List extends Component {
	constructor(props) {
    super(props);

    this.state = {
    	showInput: false,
    	value: '',
    	suggestions: [],
    	currentSuggestion: -1
    };

    this.onBlur = this.onBlur.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onSelect = this.onSelect.bind(this);
  }

  onChange(e) {
	  const { list, currentIngredient, ingredients } = this.props;
 		const { value } = e.target;
		let { suggestions } = this.state;
 		let matches = [];

 		// TODO should we also check on plural, alt and parsing expressions
 		// when we're filtering on ingredients?

 		// lookup suggestion
	  if (value && value.length > 0) {
  		matches = ingredients.filter(i => (
  			// match on ingredient names
  			(i.name.indexOf(value) > -1)
  			// and its not the current ingredient
  			&& (i.ingredientID !== currentIngredient.ingredientID)
  			// and its not already in our list
  			&& (list.indexOf(i.name) === -1)
  		)).map(i => i.name);

  		matches.sort((a, b) => a.length - b.length);
			suggestions = matches.slice(0, 5);
  	}

	  this.setState({
	  	suggestions,
	  	value
	  });
  }

	onClick(e) {
		e.preventDefault();

  	this.setState({
  		showInput: true
  	});
	}

	onKeyDown(e, key) {
  	const { code } = this.props;
		let { showInput, value, suggestions, currentSuggestion } = this.state;

		if (e.key === 'Tab') {
			e.preventDefault();
			currentSuggestion = (currentSuggestion < suggestions.length) ? currentSuggestion + 1 : 0;
		}

		if (e.key === 'Enter') {
			e.preventDefault();
  		if (suggestions[currentSuggestion]) { // accept suggestion
  			this.props.updateList(e, code, suggestions[currentSuggestion]);
  		} else { // add new ingredient from the search field
  			this.props.updateList(e, code, value);
  		}

  		suggestions = [];
  		currentSuggestion = -1;
  		value = '';
  		showInput = false;
		}

	  this.setState({
	  	suggestions,
	  	value,
  		currentSuggestion,
  		showInput
	  });
  }

  onSelect(e) {
  	console.log('onSelect');
		e.preventDefault();

  	this.setState({
  		showInput: false,
    	value: '',
    	suggestions: [],
    	currentSuggestion: -1
  	});

  	this.props.updateList(e, this.props.code, e.target.innerHTML);
  }

  onBlur(e) {
  	console.log(`onBlur: rel:${e.relatedTarget} ${e.relatedTarget === null} `);
  	if (e.relatedTarget) {
  		console.log(`len: ${e.relatedTarget.length}`);
  	}

  	// re-hide the input if we click away
  	if (!e.relatedTarget) {
  		this.setState({
	  		showInput: false,
	    	value: '',
	    	suggestions: [],
	    	currentSuggestion: -1
	  	});
  	}
  }

	renderListItem(i, index) {
  	const { code } = this.props;

  	if (code === "rel" || code === "sub") {
  		return (
  			<li key={ `${code}_${index}` }>
	  			<Button
	  				className="list"
	  				/* TODO link to other card */
		  			label={ i.name || i }
	  			/>
	  		</li>
	  	);
  	}

  	return (
  		<li key={ `${code}_${index}` }>{ i.name || i }</li>
  	);
  }

  render() {
	  const { isEditMode, label, list } = this.props;
	  const { showInput, value, suggestions, currentSuggestion } = this.state;

  	// only show this field if we're in edit mode or if we have content
	  if (isEditMode || (!isEditMode && list.length > 0)) {
	  	return (
				<div className="field list">
					{/* List Label */}
					<label>{ label }</label>

					{/* Add to List Button */
						(isEditMode)
							? <Button
									className="add"
									icon={ <FontAwesomeIcon icon={ faPlus } /> }
									type="button"
									onClick={ e => this.onClick(e) }
								/>
							: null 
					}

					{/* List Items */}
					<ul className="list">
						{ list.map((i, index) => this.renderListItem(i, index)) }
					</ul>

					{/* New List Item */
						(showInput)
							? <Input
									autoFocus={ true }
									type="text"
									className="search"
									value={ value || '' }
									onChange={ (e) => this.onChange(e) }
									onKeyDown={ (e) => this.onKeyDown(e) }
									onBlur={ (e) => this.onBlur(e) }
								/>
							: null
					}

					{/* New Item Suggestions */
						(suggestions && suggestions.length > 0)
							? <ul className="suggestions">
									{
										suggestions.map((i, index) =>
											<li key={ i + index }>
												{/* i've run into ordering issues with using onClick here instead of onMouseDown
												    and the onBlur event usually tramples it */}
												<a onMouseDown={ e => this.onSelect(e) } id={ i } className={ (currentSuggestion === index) ? 'active' : '' }>
													{ i }
												</a>
											</li>)
									}
								</ul>
							: null
					}
				</div>
			);
		}

		return null;
	}
}

export default List;