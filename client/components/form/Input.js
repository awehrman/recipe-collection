import React, { Component } from 'react';
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

	&.editable input {
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

	.fa-magic.disabled, .fa-magic.disabled:hover {
		cursor: default;
		color: #ccc;
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
	}

	onChange = (e) => {
		// on input change, update our suggestion pool
		let suggestions = [];
		const { excludedSuggestions, onChange, suggestionPool } = this.props;
		const { value } = e.target;

		if (value && suggestionPool) {
			suggestions = suggestionPool.filter(i => (
				// return partial matches
				(i.name.indexOf(value) > -1)
				// ... as long as they're not an exact match on our input
				&& (i.name !== value)
				// ... and that aren't listed as an excludedSuggestion
				&& !Object.keys(excludedSuggestions).some(key => (
					// if our property is a string just look for an exact match
					(excludedSuggestions[key] === i.name)
					// otherwise search within the array
					|| (
						(typeof excludedSuggestions[key] === 'object')
						&& (excludedSuggestions[key].findIndex(s => s === i.name) > -1)
					)
				// TODO you might need to come back to this when dealing with merging...
				))
			));

			suggestions.sort((a, b) => a.length - b.length);
			suggestions = suggestions.slice(0, 5);
		}

		this.setState({ suggestions }, onChange(e));
	}

	onKeyDown = (e) => {
		// handle tabbing thru or accepting a suggestion
		const { isSuggestionEnabled, fieldName, onSubmit, value } = this.props;

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
					onSubmit(suggestions[currentSuggestion], fieldName);
				} else {
					// accept the new input value instead of a suggestion (if this is utilized in a List component)
					onSubmit({
						id: null,
						name: e.target.value,
					}, fieldName);
				}

				// reset suggestions
				suggestions = [];
				currentSuggestion = -1;
			}

			this.setState({
				suggestions,
				currentSuggestion,
			});
		} else if (e.key === 'Enter') {
			e.preventDefault();
			// this is usually only utilized by the List component
			onSubmit(e.target.value, fieldName);
		}
	}

	onSelectSuggestion = (e, suggestion) => {
		const { fieldName, onSubmit } = this.props;

		this.setState({
			suggestions: [],
			currentSuggestion: -1,
		}, onSubmit(suggestion, fieldName));
	}

	render() {
		const {
			className, defaultValue, isEditMode, isLabelDisplayed, isPluralSuggestEnabled, isRequiredField,
			isSuggestionEnabled, label, loading, fieldName, onBlur, onSuggestPlural, placeholder, suppressLocalWarnings, tabIndex, value, warning,
		} = this.props;
		const { currentSuggestion, suggestions } = this.state;

		let inputValue = (isEditMode && (value !== undefined)) ? value : defaultValue;
		inputValue = (!inputValue) ? '' : inputValue;

		// eslint-disable-next-line
		console.log({ value, inputValue });
		return (
			<FieldSet aria-busy={ loading } className={ (isEditMode) ? `editable ${ className }` : className } disabled={ loading }>
				{/* input label */}
				<label htmlFor={ fieldName }>
					{ (isLabelDisplayed) ? <span>{ fieldName }</span> : null }

					{/* suggest plural icon */}
					{
						(isPluralSuggestEnabled)
							? (
								<FontAwesomeIcon
									className={ (!isEditMode) ? 'disabled' : '' }
									icon={ faMagic }
									onClick={ onSuggestPlural }
								/>
							) : null
					}

					{/* input element */}
					<input
						aria-busy={ loading }
						autoComplete="off"
						className={ (warning) ? 'warning' : '' }
						id={ fieldName }
						name={ fieldName }
						onBlur={ onBlur }
						onChange={ this.onChange }
						onKeyDown={ this.onKeyDown }
						placeholder={ placeholder }
						required={ isRequiredField }
						spellCheck={ isEditMode }
						tabIndex={ tabIndex }
						type="text"
						value={ inputValue }
					/>

					{/* stylistic fluff */}
					<span className={ (warning) ? 'warning' : 'highlight' }>
						{ value && value.replace(/ /g, '\u00a0') }
					</span>

					{/* validation warnings */}
					{ (!suppressLocalWarnings && warning) ? <Warning>{ warning.message }</Warning> : null }

					{/* relative - suggested values */}
					{
						(isSuggestionEnabled)
							? (
								<Suggestions
									onSelectSuggestion={ this.onSelectSuggestion }
									value={ value || '' }
									currentSuggestion={ currentSuggestion }
									suggestions={ suggestions }
								/>
							)
							: null
					}
				</label>
			</FieldSet>
		);
	}
}

Input.defaultProps = {
	className: '',
	defaultValue: '',
	excludedSuggestions: {},
	label: '',
	isEditMode: true,
	isLabelDisplayed: false,
	isPluralSuggestEnabled: false,
	isRequiredField: false,
	isSuggestionEnabled: false,
	loading: false,
	onBlur: e => e.preventDefault(),
	onChange: e => e.preventDefault(),
	onSubmit: e => e.preventDefault(),
	onSuggestPlural: e => e.preventDefault(),
	placeholder: '',
	suggestionPool: [],
	suppressLocalWarnings: false,
	tabIndex: -1,
	value: undefined,
	warning: null,
};

Input.propTypes = {
	className: PropTypes.string,
	defaultValue: PropTypes.string,
	// TODO make props more specific
	excludedSuggestions: PropTypes.object,
	fieldName: PropTypes.string.isRequired,
	isEditMode: PropTypes.bool,
	isLabelDisplayed: PropTypes.bool,
	isPluralSuggestEnabled: PropTypes.bool,
	isRequiredField: PropTypes.bool,
	isSuggestionEnabled: PropTypes.bool,
	label: PropTypes.string,
	loading: PropTypes.bool,
	onBlur: PropTypes.func,									// on input blur
	onChange: PropTypes.func,								// on input change
	onSubmit: PropTypes.func,								// for handling carriage returns (see List component)
	onSuggestPlural: PropTypes.func,				// after suggesting a plural value
	placeholder: PropTypes.string,
	// TODO make props more specifics
	suggestionPool: PropTypes.array,
	suppressLocalWarnings: PropTypes.bool,
	tabIndex: PropTypes.number,
	value: PropTypes.string,
	warning: PropTypes.string,
};

export default Input;
