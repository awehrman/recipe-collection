import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const InputStyles = styled.div`
`;

const InputField = styled.input`
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
	font-family: ${ (props) => props.theme.fontFamily };
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
`;

const InputHighlight = styled.span`
	font-size: 1em;
	user-select: none;
	line-height: 1.2;
	position: absolute;
	left: 0;
	top: 27px; /* 19 (height of input) + 4x (padding) */
	width: 100%;
	height: 0;
	color: transparent;
	font-family: ${ (props) => props.theme.fontFamily };
	overflow: hidden;

	&.warning {
		border-top: 3px solid tomato;
		max-width: 100% !important;
		width: auto !important;
	}

	max-width: 100%;
	width: auto;
`;

const Input = ({
	className,
	fieldName,
	isRequired,
	isSpellCheck,
	loading,
	onChange,
	placeholder,
	value,
}) => {
	const trimmedValue = value && value.replace(/ /g, '\u00a0');

	return (
		<InputStyles>
			<InputField
				aria-busy={ loading }
				autoComplete="off"
				className={ className }
				id={ fieldName }
				name={ fieldName }
				onChange={ onChange }
				placeholder={ placeholder }
				required={ isRequired }
				spellCheck={ isSpellCheck }
				type="text"
				value={ value }
			/>

			{/* stylistic fluff */ }
			<InputHighlight className={ className }>
				{ trimmedValue }
			</InputHighlight>
		</InputStyles>
	);
};

Input.defaultProps = {
	className: '',
	isRequired: false,
	isSpellCheck: false,
	loading: false,
	placeholder: '',
	value: '',
};

Input.propTypes = {
	className: PropTypes.string,
	fieldName: PropTypes.string.isRequired,
	isRequired: PropTypes.bool,
	isSpellCheck: PropTypes.bool,
	loading: PropTypes.bool,
	onChange: PropTypes.func.isRequired,
	placeholder: PropTypes.string,
	value: PropTypes.string,
};

export default Input;
