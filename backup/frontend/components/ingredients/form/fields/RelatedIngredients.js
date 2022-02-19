import { List as ImmutableList } from 'immutable';
import PropTypes from 'prop-types';
import React from 'react';
import pure from 'recompose/pure';
import styled from 'styled-components';

import withFieldSet from '../withFieldSet';
import List from '../../../common/List';

const RelatedIngredients = ({ className, ...props }) => (
	<RelatedIngredientsStyles>
		<List
			className={ className }
			fieldName="relatedIngredients"
			isSuggestionEnabled
			label="Related Ingredients"
			placeholder="ingredient"
			type="ingredient"
			// eslint-disable-next-line react/jsx-props-no-spreading
			{ ...props }
		/>
	</RelatedIngredientsStyles>
);

RelatedIngredients.defaultProps = {
	className: 'list',
	isRemovable: true,
	list: ImmutableList.of([]),
	loading: false,
	onChange: (e) => e.preventDefault(),
	value: null,
	values: {},
};

RelatedIngredients.whyDidYouRender = true;

RelatedIngredients.propTypes = {
	className: PropTypes.string,
	isRemovable: PropTypes.bool,
	list: PropTypes.instanceOf(ImmutableList),
	loading: PropTypes.bool,
	onChange: PropTypes.func,
	onListChange: PropTypes.func.isRequired,
	value: PropTypes.string,
	values: PropTypes.shape({}),
};

export default withFieldSet(pure(RelatedIngredients));

const RelatedIngredientsStyles = styled.div`
`;
