import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagic } from '@fortawesome/pro-regular-svg-icons';
import pluralize from 'pluralize';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import styled from 'styled-components';

import IngredientFormContext from '../../../../lib/contexts/ingredientFormContext';
import withFieldSet from '../withFieldSet';
import Input from '../../../form/Input';

const LabelStyles = styled.label`
	&.withSuggestion div {
		display: inline-block;
		margin-left: 8px;
	}

	&.withSuggestion span {
		display: inline-block;
		margin-left: 21px; /* plus the addition of the pluralize icon */
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
			color: ${ (props) => props.theme.altGreen };
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

const onSuggestPlural = (e, name, onChange) => {
	e.persist();
	let plural = null;

	try {
		plural = pluralize(name);
	} catch {
		// eh if it doesn't work it doesn't work
	}

	if (plural) onChange(e, 'plural', plural);
};

const Plural = ({ className, isSuggestEnabled, onChange, value }) => {
	const { isEditMode, loading, state } = useContext(IngredientFormContext);
	const { ingredient, validationWarnings } = state;
	const name = (ingredient && ingredient.get('name')) || '';

	const errors = validationWarnings.get('errors').toJS();
	const warnings = validationWarnings.get('warnings').toJS();
	const hasWarning = errors.length || warnings.length;

	let classNameWithWarnings = (value.length) ? `${ className }` : `${ className } enabled`;
	if (hasWarning) classNameWithWarnings += ' warning';
	if (isEditMode) classNameWithWarnings += ' editable';

	return (
		<LabelStyles className={ (isSuggestEnabled) ? 'withSuggestion' : '' }>
			{/* suggest plural icon */}
			{
				(isEditMode && isSuggestEnabled)
					? (
						<FontAwesomeIcon
							className={ (!isEditMode) ? 'disabled' : '' }
							icon={ faMagic }
							onClick={ (e) => onSuggestPlural(e, name, onChange) }
						/>
					) : null
			}

			<Input
				className={ classNameWithWarnings }
				fieldName="plural"
				isRequired
				isSpellCheck={ isEditMode }
				loading={ loading }
				onChange={ onChange }
				value={ value }
			/>
		</LabelStyles>
	);
};

Plural.defaultProps = {
	className: 'plural',
	isSuggestEnabled: true,
	onChange: (e) => e.preventDefault(),
	value: '',
};

Plural.propTypes = {
	className: PropTypes.string,
	isSuggestEnabled: PropTypes.bool,
	onChange: PropTypes.func,
	value: PropTypes.string,
};

export default withFieldSet(Plural);
