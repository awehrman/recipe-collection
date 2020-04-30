import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagic } from '@fortawesome/pro-regular-svg-icons';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import pluralize from 'pluralize';
import pure from 'recompose/pure';
import styled from 'styled-components';

// NOTE: i feel like when i pull context i get duplicate re-renders?
// maybe come back to this and confirm vs prop passings
// import PageContext from '../../../../lib/contexts/ingredients/viewContext';
import withFieldSet from '../withFieldSet';
import Input from '../../../common/Input';
import CardContext from '../../../../lib/contexts/ingredients/cardContext';

const Plural = ({
	className,
	isPluralSuggestEnabled,
	loading,
	onChange,
	singular,
	value,
}) => {
	const ctx = useContext(CardContext);
	const isEditMode = ctx.get('isEditMode');

	function onSuggestPlural(e) {
		e.persist();
		if (!singular || (singular === '')) return null;

		let plural = null;
		try {
			plural = pluralize(singular);
		} catch { /* if it doesn't work then oh well */ }

		return onChange(e, 'plural', plural);
	}

	return (
		<LabelStyles>
			{/* suggest plural icon */}
			{
				(isEditMode && isPluralSuggestEnabled)
					? (
						<FontAwesomeIcon
							className={ (!isEditMode) ? 'disabled' : '' }
							icon={ faMagic }
							onClick={ (e) => onSuggestPlural(e) }
						/>
					) : null
			}
			<Input
				className={ (isEditMode && isPluralSuggestEnabled) ? `${ className } withSuggest` : className }
				fieldName="plural"
				isSpellCheck={ isEditMode }
				loading={ loading }
				onChange={ onChange }
				placeholder="plural"
				value={ value }
			/>
		</LabelStyles>
	);
};

Plural.defaultProps = {
	className: '',
	isPluralSuggestEnabled: false,
	loading: false,
	onChange: (e) => e.preventDefault(),
	singular: '',
	value: '',
};

Plural.whyDidYouRender = true;

Plural.propTypes = {
	className: PropTypes.string,
	isPluralSuggestEnabled: PropTypes.bool,
	loading: PropTypes.bool,
	onChange: PropTypes.func,
	singular: PropTypes.string,
	value: PropTypes.string,
};

export default withFieldSet(pure(Plural));


const LabelStyles = styled.label`
	display: flex;

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
