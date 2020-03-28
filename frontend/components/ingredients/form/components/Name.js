import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import styled from 'styled-components';

import IngredientFormContext from '../../../../lib/contexts/ingredientFormContext';
import withFieldSet from '../withFieldSet';
import Input from '../../../form/Input';

const LabelStyles = styled.label`

`;

const Name = ({ onChange, value }) => {
	const { isEditMode, loading, validationWarnings } = useContext(IngredientFormContext);
	const { errors, warnings } = validationWarnings;
	const hasWarning = Boolean(errors.name) || Boolean(warnings.name);
	let className = (value.length) ? '' : 'enabled';
	if (hasWarning) {
		className += ' warning';
	}
	if (isEditMode) {
		className += ' editable';
	}

	console.log('Name', { className });

	return (
		<LabelStyles>
			<Input
				className={ className }
				fieldName="name"
				isRequired
				isSpellCheck={ isEditMode }
				loading={ loading }
				onChange={ onChange }
				placeholder="Name"
				value={ value }
			/>
		</LabelStyles>
	);
};

Name.defaultProps = {
	onChange: (e) => e.preventDefault(),
	value: '',
};

Name.propTypes = {
	onChange: PropTypes.func,
	value: PropTypes.string,
};

export default withFieldSet(Name);
