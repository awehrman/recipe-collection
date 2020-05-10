import { List as ImmutableList } from 'immutable';
import PropTypes from 'prop-types';
import React from 'react';
import pure from 'recompose/pure';
import styled from 'styled-components';

import withFieldSet from '../withFieldSet';
import List from './List';

const AlternateNames = ({ className, ...props }) => (
	<AlternateNameStyles>
		<List
			className={ className }
			fieldName="alternateNames"
			label="Alternate Names"
			// eslint-disable-next-line react/jsx-props-no-spreading
			{ ...props }
		/>
	</AlternateNameStyles>
);

AlternateNames.defaultProps = {
	className: 'list',
	isRemovable: true,
	isPluralSuggestEnabled: true,
	list: ImmutableList.of([]),
	loading: false,
	onChange: (e) => e.preventDefault(),
	value: null,
};

AlternateNames.whyDidYouRender = true;

AlternateNames.propTypes = {
	className: PropTypes.string,
	isRemovable: PropTypes.bool,
	isPluralSuggestEnabled: PropTypes.bool,
	list: PropTypes.instanceOf(ImmutableList),
	loading: PropTypes.bool,
	onChange: PropTypes.func,
	onListChange: PropTypes.func.isRequired,
	value: PropTypes.string,
};

export default withFieldSet(pure(AlternateNames));

const AlternateNameStyles = styled.div`
`;
