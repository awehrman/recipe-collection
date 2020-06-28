import { fromJS, List as ImmutableList } from 'immutable';
import PropTypes from 'prop-types';
import React from 'react';
import pure from 'recompose/pure';
import styled from 'styled-components';

import withFieldSet from '../withFieldSet';
import List from '../../../common/List';

const References = ({ className, list, ...props }) => {
	// TODO i'll need to adjust the List component to support linking to recipes
	// but in the meantime i'm just going to force this shape to use the current component
	const references = list.map((ref) => ({
		id: ref.get('id'),
		name: ref.get('line').get('reference'),
	}));

	return (
		<ReferencesStyles>
			<List
				className={ className }
				fieldName="References"
				label="References"
				list={ fromJS(references) }
				type="reference"
				// eslint-disable-next-line react/jsx-props-no-spreading
				{ ...props }
			/>
		</ReferencesStyles>
	);
};

References.defaultProps = {
	className: 'list',
	isRemovable: false,
	list: ImmutableList.of([]),
	loading: false,
	onChange: (e) => e.preventDefault(),
	onListChange: () => {},
	value: null,
};

References.whyDidYouRender = true;

References.propTypes = {
	className: PropTypes.string,
	isRemovable: PropTypes.bool,
	list: PropTypes.instanceOf(ImmutableList),
	loading: PropTypes.bool,
	onChange: PropTypes.func,
	onListChange: PropTypes.func,
	value: PropTypes.string,
};

export default withFieldSet(pure(References));

const ReferencesStyles = styled.div`
`;
