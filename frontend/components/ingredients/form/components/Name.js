import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import pure from 'recompose/pure';
import styled from 'styled-components';

import CardContext from '../../../../lib/contexts/ingredients/cardContext';
import withFieldSet from '../withFieldSet';
import Input from '../../../common/Input';

const Name = ({ className, loading, onChange, value }) => {
	const ctx = useContext(CardContext);
	const isEditMode = ctx.get('isEditMode');

	return (
		<LabelStyles>
			<Input
				className={ className }
				fieldName="name"
				isRequired
				isSpellCheck={ isEditMode }
				loading={ loading }
				onChange={ onChange }
				placeholder="name"
				value={ value }
			/>
		</LabelStyles>
	);
};

Name.defaultProps = {
	className: '',
	loading: false,
	onChange: (e) => e.preventDefault(),
	value: '',
};

Name.whyDidYouRender = true;

Name.propTypes = {
	className: PropTypes.string,
	loading: PropTypes.bool,
	onChange: PropTypes.func,
	value: PropTypes.string,
};

export default withFieldSet(pure(Name));

const LabelStyles = styled.label`
`;
