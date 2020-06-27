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
				(isPluralSuggestEnabled)
					? (
						<FontAwesomeIcon
							icon={ faMagic }
							onClick={ (e) => onSuggestPlural(e) }
						/>
					) : null
			}
			<Input
				className={ className }
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
	svg {
		display: inline-block;
		width: 13px;
		color: #ccc;
		margin-right: 13px;
		position: absolute;
		top: 8px;
	}

	div > input {
		flex: 2;
		width: 100%;
		position: absolute;
		left: 26px;
	}

	span.highlight {
		position: absolute;
		left: 26px;
		max-width: 280px;
	}
`;
