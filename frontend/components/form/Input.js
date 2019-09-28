import { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagic } from '@fortawesome/pro-regular-svg-icons';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Suggestions from './Suggestions';

const FieldSet = styled.fieldset`
	position: relative;
	border: 0;
	padding: 0;

	&.hidden {
		display: none;
	}

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
		margin-bottom: 5px; /* you'll want at least the height of the span border */

		&::placeholder {
			font-style: italic;
			color: #ccc;
		}

		&.warning {
			color: tomato;
		}
	}

	span#highlight {
		font-size: 1em;
		user-select: none;
		line-height: 1.2;
		position: absolute;
		left: 0;
		top: 27px; /* 19 (height of input) + 4x (padding) */
		/*width: 100%; SET BACK TO MAX-WIDTH AFTER TESTING!!!! */
		height: 0;
		color: transparent;
		font-family: ${ props => props.theme.fontFamily };
		overflow: hidden;

		&.warning {
			border-top: 3px solid tomato;
			max-width: 100% !important;
			width: auto !important;
		}

		/*
			if there's content in the input field, we want to turn width off and max-width to auto
			max-width: 100%;
			width: auto;
		*/

		/* TODO is .fa-magic is enabled then adjust this width to calc that width*/
	}

	&.editable input {
		cursor: text;
		caret-color: #222;

		&:focus {
			/* disable the default dotted box borders since WE'RE USING SEXY UNDERLINES */
			outline: none !important;

			/* if there's no content in this field and the field has focus */
			& + span#highlight {
				/* the ends look trash with this enabled; you could look into an svg or fa solution */
				/* border-style: dotted !important; */
				/* TODO this needs to pull from Input props; for Cards this will need to be a lightened highlight or disabled */
				border-top: 3px solid #C3E7E0;
				max-width: auto;
				width: 100%;
			}

			/* if there IS content in this field and the field has focus then only highlight the length of the text */
			& + span#highlight.enabled {
				/* the ends look trash with this enabled; you could look into an svg or fa solution */
				/* border-style: dotted !important; */
				/* TODO this needs to pull from Input props; for Cards this will need to be highlight */
				border-top: 3px solid ${ props => props.theme.altGreen };
				max-width: 100% !important;
				width: auto !important;
			}

			& + span#highlight.warning {
				border-top: 3px solid ${ props => props.theme.red };
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

		/* make sure you restrict the length of the span highlight so it doesn't sneak off the edge */
		~ span#highlight {
			margin-left: 20px;
			top: 24px;
			max-width: auto !important;
			width: calc(100% - 20px) !important;
		}

		~ span#highlight.enabled {
			margin-left: 20px;
			top: 24px;
			max-width: calc(100% - 20px) !important;
			width: auto !important;
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
						// eslint-disable-next-line react/prop-types
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
		// console.warn('Input - onKeyDown');
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
					onSubmit(e, suggestions[currentSuggestion], fieldName, false);
				} else {
					// accept the new input value instead of a suggestion (if this is utilized in a List component)
					onSubmit(e, { id: null, name: e.target.value }, fieldName, false);
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
			onSubmit(e, { name: e.target.value }, fieldName, false);
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
			className, defaultValue, fieldName,
			isEditMode, isLabelDisplayed, isPluralSuggestEnabled, isRequiredField,
			isSuggestionEnabled, label, loading, onBlur, onSuggestPlural, placeholder,
			pluralBasis, suppressLocalWarnings, tabIndex, value, warnings,
		} = this.props;
		const { currentSuggestion, suggestions } = this.state;

		let inputValue = (isEditMode && (value !== undefined)) ? value : defaultValue;
		inputValue = (!inputValue) ? '' : inputValue;

		let highlightClassName = (inputValue.length > 0) ? 'enabled' : '';
		const warningIndex = warnings.findIndex(w => (w.value === inputValue));
		highlightClassName += (warningIndex > -1) ? ' warning' : '';

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
									onClick={ e => onSuggestPlural(e, pluralBasis) }
								/>
							) : null
					}

					{/* input element */}
					<input
						aria-busy={ loading }
						autoComplete="off"
						className={ (warningIndex > -1) ? ' warning' : '' }
						id={ fieldName }
						name={ fieldName }
						onBlur={ onBlur }
						onChange={ e => this.onChange(e) }
						onKeyDown={ e => this.onKeyDown(e) }
						placeholder={ placeholder }
						required={ isRequiredField }
						spellCheck={ isEditMode }
						tabIndex={ tabIndex }
						type="text"
						value={ inputValue }
					/>

					{/* stylistic fluff */}
					<span id="highlight" className={ highlightClassName.trim() }>
						{ value && value.replace(/ /g, '\u00a0') }
					</span>

					{/* validation warnings */}
					{ (!suppressLocalWarnings && warnings && (warnings.length > 0)) ? warnings.map(w => <Warning>{ w.message }</Warning>) : null }

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
	excludedSuggestions: [],
	label: '',
	isEditMode: true,
	isLabelDisplayed: false,
	isPluralSuggestEnabled: false,
	isRequiredField: false,
	isSuggestionEnabled: false,
	loading: false,
	onBlur: () => {},
	onSubmit: e => e.preventDefault(),
	onSuggestPlural: e => e.preventDefault(),
	placeholder: '',
	pluralBasis: null,
	suggestionPool: [],
	suppressLocalWarnings: false,
	tabIndex: 0,
	value: undefined,
	warnings: [],
};

Input.propTypes = {
	className: PropTypes.string,
	defaultValue: PropTypes.string,
	excludedSuggestions: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string, /* if the id is left blank, its a new ingredient */
		name: PropTypes.string.isRequired,
	})),
	fieldName: PropTypes.string.isRequired,
	isEditMode: PropTypes.bool,
	isLabelDisplayed: PropTypes.bool,
	isPluralSuggestEnabled: PropTypes.bool,
	isRequiredField: PropTypes.bool,
	isSuggestionEnabled: PropTypes.bool,
	label: PropTypes.string,
	loading: PropTypes.bool,
	onBlur: PropTypes.func,									// on input blur
	onChange: PropTypes.func.isRequired,								// on input change
	onSubmit: PropTypes.func,														// for handling carriage returns (see List component)
	onSuggestPlural: PropTypes.func,					// after suggesting a plural value
	placeholder: PropTypes.string,
	pluralBasis: PropTypes.string,											// what value should we try to pluralize?
	suggestionPool: PropTypes.arrayOf(PropTypes.shape({
		id: PropTypes.string, /* if the id is left blank, its a new ingredient */
		name: PropTypes.string.isRequired,
	})),
	suppressLocalWarnings: PropTypes.bool,
	tabIndex: PropTypes.number,
	value: PropTypes.string,
	warnings: PropTypes.arrayOf(PropTypes.shape({
		__typename: PropTypes.string,
		fieldName: PropTypes.string.isRequired,
		preventSave: PropTypes.bool.isRequired,
		value: PropTypes.string.isRequired,
		message: PropTypes.string.isRequired,
	})),
};

export default Input;
