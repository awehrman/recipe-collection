import { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagic } from '@fortawesome/pro-regular-svg-icons';
import PropTypes from 'prop-types';
import styled from 'styled-components';

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
	onKeyDown = (e) => {
		const { fieldName, onSubmit } = this.props;
		if (e.key === 'Enter') {
			e.preventDefault();
			// this is usually only utilized by the List component
			onSubmit(e, { name: e.target.value }, fieldName, false);
		}
	}

	render() {
		const {
			className, defaultValue, fieldName,
			isEditMode, isLabelDisplayed, isPluralSuggestEnabled, isRequiredField,
			label, loading, onBlur, onChange, onSuggestPlural, placeholder, pluralBasis,
			suppressLocalWarnings, tabIndex, value, warnings,
		} = this.props;

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
						onChange={ e => onChange(e) }
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
				</label>
			</FieldSet>
		);
	}
}

Input.defaultProps = {
	className: '',
	defaultValue: '',
	label: '',
	isEditMode: true,
	isLabelDisplayed: false,
	isPluralSuggestEnabled: false,
	isRequiredField: false,
	loading: false,
	onBlur: () => {},
	onChange: () => {},
	onSubmit: e => e.preventDefault(),
	onSuggestPlural: e => e.preventDefault(),
	placeholder: '',
	pluralBasis: null,
	suppressLocalWarnings: false,
	tabIndex: 0,
	value: undefined,
	warnings: [],
};

Input.propTypes = {
	className: PropTypes.string,
	defaultValue: PropTypes.string,
	fieldName: PropTypes.string.isRequired,
	isEditMode: PropTypes.bool,
	isLabelDisplayed: PropTypes.bool,
	isPluralSuggestEnabled: PropTypes.bool,
	isRequiredField: PropTypes.bool,
	label: PropTypes.string,
	loading: PropTypes.bool,
	onBlur: PropTypes.func,
	onChange: PropTypes.func,
	onSubmit: PropTypes.func,
	onSuggestPlural: PropTypes.func,
	placeholder: PropTypes.string,
	pluralBasis: PropTypes.string,
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
