import React, { Component } from 'react';
import styled from 'styled-components';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';

import faMagic from '@fortawesome/fontawesome-pro-regular/faMagic';

import Suggestions from './Suggestions';

const FieldSet = styled.div`
  position: relative;
  width: 380px;
  margin: 20px 0;

  label {
  	font-size: .875em;
  	font-weight: 600;
  	color: #222;
  }

  .highlight {
	  font-size: 1em;
	  user-select: none;
	  line-height: 1.2;
	  border-top: 3px solid ${ props => props.theme.altGreen };
	  position: absolute;
	  left: 0;
	  bottom: 0;
	  max-width: 100%;
	  height: 0;
	  color: transparent;
	  font-family: ${ props => props.theme.fontFamily };
	  overflow: hidden;
	}

	input {
	  width: 100%;
	  min-width: 100%;
	  padding: 8px 0;
	  border-radius: 0;
	  line-height: 1.2;
	  background-color: transparent;
	  color: #222;
	  font-size: 1em;
	  border: none;
	  outline: none;
	  border-bottom: 3px solid #ddd;
	  font-family: ${ props => props.theme.fontFamily };

	  &::placeholder {
	  	font-style: italic;
	  	color: #ccc;
	  }

	  &:focus {
	    + .highlight {
	      border-top: 3px solid ${ props => props.theme.highlight };
	    }
	  }
	}

	.fa-magic {
		color: #ccc;
		cursor: pointer;
		width: 13px;
		position: absolute;
		bottom: 10px;
		right: 0;

		&:hover {
			color: ${ props => props.theme.altGreen };
		}
	}
`;

class Input extends Component {
	constructor(props) {
		super(props);

		this.state = {
    	suggestions: [],
    	currentSuggestion: -1
		};

		this.onKeyDown = this.onKeyDown.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onSelectSuggestion = this.onSelectSuggestion.bind(this);
	}

	onSelectSuggestion(e, suggestion) {
		this.setState({
    	suggestions: [],
    	currentSuggestion: -1
		}, this.props.onSelectSuggestion(this.props.name, suggestion));
	}

	onChange(e) {
		let suggestions = [];
		const { suggestionPool } = this.props;
		const { value } = e.target;

		if (value && value.length > 0 && suggestionPool) {
			suggestions = suggestionPool.filter(i => (
  			// match on ingredient names
  			(i.name.indexOf(value) > -1)
  			// and its not the current value
  			&& (i.ingredientID !== value)
  		));

  		suggestions.sort((a, b) => a.length - b.length);
			suggestions = suggestions.slice(0, 5);
		}

		this.setState({
			suggestions
		}, this.props.onChange(e));
	}

	onKeyDown(e) {
		// this doesn't work when focus moves to the first one; only only subsequent tabs thru the list
		let { suggestions, currentSuggestion } = this.state;
		const { name, showSuggestions } = this.props;

		if (e.key === 'Tab') {
			// only prevent tabbing if we're in an input component without suggestions
			// TODO need to re-enable this if we've selected a value
			if (showSuggestions) {
				e.preventDefault();
			}
			currentSuggestion = (currentSuggestion < suggestions.length) ? currentSuggestion + 1 : 0;
		}

		if (e.key === 'Enter') {
			e.preventDefault();
			
			if (showSuggestions) {
	  		if (suggestions[currentSuggestion]) {
	  			// accept suggestion
	  			this.props.onSelectSuggestion(e, suggestions[currentSuggestion]);
	  		} else {
	  			// accept new input
	  			this.props.onSelectSuggestion(e, { id: null, name: e.target.value });
	  		}

	  		suggestions = [];
	  		currentSuggestion = -1;
	  	} else {
	  		this.props.addToList(name, e.target.value);
	  	}
		}

	  this.setState({
	  	suggestions,
  		currentSuggestion
	  });
	}

  render() {
  	const { autoFocus, label, name, required, placeholder, showLabel, showSuggestions, suggestPlural, tabIndex, value } = this.props;
  	const { currentSuggestion, suggestions } = this.state;

    return (
      <FieldSet>
      	{
					(showLabel)
						? <label htmlFor={ name }>{ label }</label>
						: null
				}

        <input
        	autoFocus={ autoFocus }
        	autoComplete="off"
          name={ name }
          onBlur={ this.props.onBlur }
        	onChange={ this.onChange }
        	onKeyDown={ this.onKeyDown }
          placeholder={ placeholder }
          required={ required }
          tabIndex={ tabIndex }
          type="text"
          value={ value || '' }
        />

        {
					(suggestPlural)
						? <FontAwesomeIcon icon={ faMagic } onClick={ e => this.props.onSuggestPlural(e) } />
						: null
				}

        <span className='highlight'>
          { value && value.replace(/ /g, "\u00a0") }
        </span>

        {
        	(showSuggestions)
        		? <Suggestions
        				onSelectSuggestion={ this.onSelectSuggestion }
        				value={ value || ''}
        				currentSuggestion={ currentSuggestion }
        				suggestions={ suggestions }
        			/>
        		: null
        }
      </FieldSet>
    );
  }
}

// TODO add PropTypes

export default Input;