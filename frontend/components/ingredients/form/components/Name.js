import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import styled from 'styled-components';

import IngredientFormContext from '../../../../lib/contexts/ingredientFormContext';
import withFieldSet from '../withFieldSet';
import Input from '../../../form/Input';

const LabelStyles = styled.label`
`;

const Name = ({ onChange, value }) => {
	const { isEditMode, loading, state } = useContext(IngredientFormContext);
	const { validationWarnings } = state;
	const errors = validationWarnings.get('errors');
	const warnings = validationWarnings.get('warnings');
	const hasWarning = errors.size || warnings.size;
	let className = (value.length) ? '' : 'enabled';
	if (hasWarning) className += ' warning';
	if (isEditMode) className += ' editable';

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
