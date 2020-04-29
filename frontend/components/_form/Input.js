import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import CardContext from '../../lib/contexts/ingredients/cardContext';

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
	const ctx = useContext(CardContext);
	const isEditMode = ctx.get('isEditMode');
	console.log('Input', { isEditMode });

	return (
		<InputStyles className={ className }>
			<InputField
				aria-busy={ loading }
				autoComplete="off"
				className={ className }
				disabled={ !isEditMode }
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

const InputStyles = styled.div`
	&.withSuggest {
		margin-left: 8px;

		span.withSuggest {
			margin-left: 18px;
		}
	}
`;

// something here is breaking the initial EditMode input
const InputField = styled.input`
	width: 100%;
	min-width: 100%;
	padding: 4px 0;
	border-radius: 0;
	line-height: 1.2;
	color: #222;
	font-size: 1em;
	border: 0;
	outline: 0;
	font-family: ${ (props) => props.theme.fontFamily };
	margin-bottom: 5px; /* you'll want at least the height of the span border */
	
	/* background-color: transparent; for whatever reason this breaks the initial edit mode inputs */
	background-color: white; /* TODO will need to adjust this for the AddNew form */
	border-bottom: 3px solid #ddd;


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
