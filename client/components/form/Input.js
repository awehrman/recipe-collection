import { Component } from 'react';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import faMagic from '@fortawesome/fontawesome-pro-regular/faMagic';

import Suggestions from './Suggestions';

const FieldSet = styled.fieldset`
	position: relative;
	border: 0;
	padding: 0;

	input {
		position: relative;
	  width: 100%;
	  min-width: 100%;
	  padding: 4px 0;
	  border-radius: 0;
	  line-height: 1.2;
	  background-color: transparent;
	  color: #222;
	  font-size: 1em;
	  border: none;
	  outline: none;
	  border-bottom: 3px solid #ddd;
	  font-family: ${ props => props.theme.fontFamily };
	  cursor: default;
	  caret-color: transparent; /* hide the input cursor when not in edit mode */

	  &.warning {
	  	color: tomato;
	  }

	  &::placeholder {
	  	font-style: italic;
	  	color: #ccc;
	  }
	}

  span.highlight, span.warning {
	  font-size: 1em;
	  user-select: none;
	  line-height: 1.2;
	  /* uncomment this if you want a consistent underline */
	  /*border-top: 3px solid ${ props => props.theme.altGreen };*/
	  position: absolute;
	  left: 0;
	  top: 27px; /* 19 (height of input) + 2x (padding) */
	  max-width: 100%;
	  height: 0;
	  color: transparent;
	  font-family: ${ props => props.theme.fontFamily };
	  overflow: hidden;
	}

	span.warning {
		border-top: 3px solid tomato;
	}

	&.editable > input {
		cursor: text;
		caret-color: #222;

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
		position: relative;
		left: 0;
		top: 0;
		display: inline-block;
		z-index: 1;

		&:hover {
			color: ${ props => props.theme.altGreen };
		}

		~ input {
	  	padding-left: 20px;
			position: relative;
			top: -24px;
	  }

	  ~ span {
	  	margin-left: 20px;
	  	top: 24px;
	  }
	}
`;

const Warning = styled.div`
	color: tomato;
	position: absolute;
	right: 0;
	margin-top: 4px;
	font-size: .8em;
`;

class Input extends Component {
	constructor(props) {
    super(props);

    this.state = {
	  	currentSuggestion: -1,
	  	suggestions: [],
		};

    this.textInput = React.createRef();
  }

	componentDidMount = () => {
		// set focus to the element when it mounts
		this.textInput.current.focus();
	}

	onChange = (e) => {
		let suggestions = [];
		const { suggestionPool } = this.props;
		const { value } = e.target;

		if (value && suggestionPool) {
			suggestions = suggestionPool.filter(i => (
  			// find partial matches
  			(i.name.indexOf(value) > -1)
  			// as long as its not an exact match
  			&& (i.name !== value)
  		));

  		suggestions.sort((a, b) => a.length - b.length);
			suggestions = suggestions.slice(0, 5);
		}

		this.setState({
			suggestions,
		}, this.props.onChange(e));
	}

	onKeyDown = (e) => {
		// handle tabbing thru or accepting a suggestion
		const { isSuggestionEnabled, name, value } = this.props;

		if (isSuggestionEnabled) {
			let { suggestions, currentSuggestion } = this.state;
			
			// handle tabs
			if (e.key === 'Tab' && value && suggestions && (suggestions.length > 0)) {
				// redirect the focus to the next suggestion instead of the next element if we have some kind of input value
				e.preventDefault();
				currentSuggestion = ((currentSuggestion + 1) < suggestions.length) ? currentSuggestion + 1 : 0;
			}

			// handle returns
			if (e.key === 'Enter') {
				e.preventDefault();

				if (suggestions[currentSuggestion]) {
					// accept the current highlighted suggestion
					this.props.onSubmit(suggestions[currentSuggestion], name);
				} else {
					// accept the new input value instead of a suggestion (if this is utilized in a List component)
					this.props.onSubmit({ id: null, name: e.target.value }, name);
				}

				// reset suggestions
				suggestions = [];
	  		currentSuggestion = -1;
			}

			this.setState({
		  	suggestions,
	  		currentSuggestion
		  });
		} else if (e.key === 'Enter') {
			e.preventDefault();
			// this is usually only utilized by the List component
			this.props.onSubmit(e.target.value, name);
		}
	}

	onSelectSuggestion = (e, suggestion) => {
		const { name } = this.props;

		this.setState({
    	suggestions: [],
    	currentSuggestion: -1
		}, this.props.onSubmit(suggestion, name));
	}

  render() {
  	const { className, isEditMode, isLabelDisplayed, isPluralSuggestEnabled, isRequiredField,
  					isSuggestionEnabled, label, loading, name, placeholder, suppressWarnings, value, warning } = this.props;
  	const { currentSuggestion, suggestions } = this.state;

    return (
      <FieldSet aria-busy={ loading } className={ (isEditMode) ? `editable ${ className }` : className } disabled={ loading }>
      	{/* input label */}
      	{ (isLabelDisplayed) ? <label htmlFor={ name }>{ label }</label> : null }
				
				{/* suggest plural icon */}
        { (isPluralSuggestEnabled) ? <FontAwesomeIcon icon={ faMagic } onClick={ this.props.onSuggestPlural } /> : null }

				{/* input element */}
        <input
        	autoComplete="off"
        	className={ (warning) ? 'warning' : '' } aria-busy={ loading }
          name={ name }
          onBlur={ this.props.onBlur }
        	onChange={ this.onChange }
        	onKeyDown={ this.onKeyDown }
          placeholder={ placeholder }
          ref={ this.textInput }
          required={ isRequiredField }
          spellCheck={ isEditMode }
          type="text"
          value={ value || '' }
        />

				{/* abs - stylistic fluff */}
        <span className={ (warning) ? 'warning' : 'highlight' }>
          { value && value.replace(/ /g, "\u00a0") }
        </span>

				{/* validation warnings */}
        { (!suppressWarnings && warning) ? <Warning>{ warning }</Warning> : null }

				{/* relative - suggested values */}
        {
        	(isSuggestionEnabled)
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

Input.defaultProps = {
	isEditMode: true,
	isLabelDisplayed: true,
	isPluralSuggestEnabled: false,
	isRequiredField: false,
	isSuggestionEnabled: false,
	loading: false,
	onListChange: () => {},
	onSubmit: () => {},
	onSuggestPlural: () => {},
	onValidation: () => {},
	suppressWarnings: false,
	warning: ''
};

Input.propTypes = {
	className: PropTypes.string,
	isEditMode: PropTypes.bool,
	isLabelDisplayed: PropTypes.bool,
	isPluralSuggestEnabled: PropTypes.bool,
	isRequiredField: PropTypes.bool,
	isSuggestionEnabled: PropTypes.bool,
	label: PropTypes.string,
	loading: PropTypes.bool,
	name: PropTypes.string,
	onBlur: PropTypes.func,									// on input blur
	onChange: PropTypes.func,								// on input change
	onListChange: PropTypes.func,						// after adding items to the list
	onSubmit: PropTypes.func,								// for handling carriage returns (see List component)
	onSuggestPlural: PropTypes.func,				// after suggesting a plural value
	onValidation: PropTypes.func,						// passing validation back to parent
	placeholder: PropTypes.string,
	suggestionPool: PropTypes.array,
	suppressWarnings: PropTypes.bool,
	value: PropTypes.string,
	warning: PropTypes.string,
};

export default Input;