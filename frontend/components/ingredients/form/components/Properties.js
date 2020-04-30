import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import pure from 'recompose/pure';
import styled from 'styled-components';

import CardContext from '../../../../lib/contexts/ingredients/cardContext';
import withFieldSet from '../withFieldSet';
import Input from '../../../common/Input';

const Properties = ({ className, loading, onChange, values }) => {
	const ctx = useContext(CardContext);
	const isEditMode = ctx.get('isEditMode');

	return (
		<PropertiesStyles>
			{
				keys.map((k, i) => {
					// if we're not in edit mode, only show the checked values
					if (isEditMode || values[i]) {
						return (
							<Checkbox key={ k } className={ (isEditMode) ? `editable ${ className }` : className }>
								<label htmlFor={ k }>
									<input
										type={ type }
										id={ k }
										checked={ values[i] }
										onChange={ this.onChange }
										onKeyDown={ (isEditMode) ? (e) => onKeyDown(e, fieldName) : (e) => e.preventDefault() }
										value={ k }
									/>
									<span>{ k }</span>
								</label>
							</Checkbox>
						);
					}
					return null;
				}).filter((c) => c)
			}
		</PropertiesStyles>
	);
};

Properties.defaultProps = {
	className: '',
	loading: false,
	onChange: (e) => e.preventDefault(),
	values: '',
};

Properties.whyDidYouRender = true;

Properties.propTypes = {
	className: PropTypes.string,
	loading: PropTypes.bool,
	onChange: PropTypes.func,
	values: PropTypes.string,
};

export default withFieldSet(pure(Properties));

const PropertiesStyles = styled.label`
`;
