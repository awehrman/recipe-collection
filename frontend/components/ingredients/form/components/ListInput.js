// import { List as ImmutableList } from 'immutable';
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import Input from '../../../common/Input';
import withFieldSet from '../withFieldSet';

const ListInput = ({
	className,
	fieldName,
	hideInput,
	// list,
	loading,
	onAddItem,
	// onBlur,
	onChange,
	value,
}) => {
	function onKeyDown(e) {
		// if we're ready to add the item, then stop the event and hide the input
		if (e.which === 13) {
			e.preventDefault();
			e.stopPropagation();
			hideInput();
			return onAddItem('add', e.target.value, fieldName);
		}

		e.persist();
		return onChange(e);
	}

	return (
		<ListInputStyles>
			<Input
				className={ className }
				fieldName={ `${ fieldName }_input` }
				isSpellCheck
				loading={ loading }
				// onBlur={ onBlur }
				onChange={ onChange }
				onKeyDown={ onKeyDown }
				value={ value }
			/>
		</ListInputStyles>
	);
};

ListInput.defaultProps = {
	className: 'list',
	hideInput: () => {},
	// list: ImmutableList.of([]),
	loading: false,
	onAddItem: () => {},
	// onBlur: (e) => e.preventDefault(),
	onChange: (e) => e.preventDefault(),
	value: null,
};

ListInput.propTypes = {
	className: PropTypes.string,
	fieldName: PropTypes.string.isRequired,
	hideInput: PropTypes.func,
	// list: PropTypes.instanceOf(ImmutableList),
	loading: PropTypes.bool,
	onAddItem: PropTypes.func,
	// onBlur: PropTypes.func,
	onChange: PropTypes.func,
	value: PropTypes.string,
};

// TODO add withSuggestions
export default withFieldSet(ListInput);

const ListInputStyles = styled.div`
`;
