import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import pure from 'recompose/pure';
import styled from 'styled-components';

import CardContext from '../../../../lib/contexts/ingredients/cardContext';
import withFieldSet from '../withFieldSet';
import Input from '../../../common/Input';

const Substitutes = ({ loading, onChange, value }) => {
	const ctx = useContext(CardContext);
	const isEditMode = ctx.get('isEditMode');
	console.log({ value });

	return (
		<LabelStyles>
			Substitutes
		</LabelStyles>
	);
};

Substitutes.defaultProps = {
	loading: false,
	onChange: (e) => e.preventDefault(),
	value: '',
};

Substitutes.whyDidYouRender = true;

Substitutes.propTypes = {
	loading: PropTypes.bool,
	onChange: PropTypes.func,
	value: PropTypes.shape({ toJS: PropTypes.func }),
};

export default withFieldSet(pure(Substitutes));

const LabelStyles = styled.label`
`;
