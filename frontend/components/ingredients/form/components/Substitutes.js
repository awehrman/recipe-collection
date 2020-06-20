import { List as ImmutableList } from 'immutable';
import PropTypes from 'prop-types';
import React from 'react';
import pure from 'recompose/pure';
import styled from 'styled-components';

import withFieldSet from '../withFieldSet';
import List from './List';

const Substitutes = ({ className, ...props }) => (
	<SubstitutesStyles>
		<List
			className={ className }
			fieldName="substitutes"
			isSuggestionEnabled
			label="Substitutes"
			// eslint-disable-next-line react/jsx-props-no-spreading
			{ ...props }
		/>
	</SubstitutesStyles>
);

Substitutes.defaultProps = {
	className: 'list',
	isRemovable: true,
	list: ImmutableList.of([]),
	loading: false,
	onChange: (e) => e.preventDefault(),
	value: null,
};

Substitutes.whyDidYouRender = true;

Substitutes.propTypes = {
	className: PropTypes.string,
	isRemovable: PropTypes.bool,
	list: PropTypes.instanceOf(ImmutableList),
	loading: PropTypes.bool,
	onChange: PropTypes.func,
	onListChange: PropTypes.func.isRequired,
	value: PropTypes.string,
};

export default withFieldSet(pure(Substitutes));

const SubstitutesStyles = styled.div`
`;
