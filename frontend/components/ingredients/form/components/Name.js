import PropTypes from 'prop-types';
import React from 'react';
import pure from 'recompose/pure';
import styled from 'styled-components';

// NOTE: i feel like when i pull context i get duplicate re-renders?
// maybe come back to this and confirm vs prop passings
// import PageContext from '../../../../lib/contexts/ingredients/viewContext';
import withFieldSet from '../withFieldSet';
import Input from '../../../form/Input';

const LabelStyles = styled.label`
`;

const Name = ({ className, isEditMode, loading, onChange, value }) => (
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

Name.defaultProps = {
	className: '',
	isEditMode: false,
	loading: false,
	onChange: (e) => e.preventDefault(),
	value: '',
};

Name.whyDidYouRender = true;

Name.propTypes = {
	className: PropTypes.string,
	isEditMode: PropTypes.bool,
	loading: PropTypes.bool,
	onChange: PropTypes.func,
	value: PropTypes.string,
};

export default withFieldSet(pure(Name));
