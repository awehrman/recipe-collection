import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import pure from 'recompose/pure';
import styled from 'styled-components';

import CardContext from '../../../../lib/contexts/ingredients/cardContext';
import withFieldSet from '../withFieldSet';

const Properties = ({ onChange, values }) => {
	const ctx = useContext(CardContext);
	const isEditMode = ctx.get('isEditMode');
	const properties = values.toJS();
	delete properties.id;
	delete properties.__typename; // TODO it feels like this shouldn't even be passed around
	console.log({ properties });

	function onPropertyChange(e, property) {
		if (!isEditMode) return e.preventDefault();
		return onChange(e, 'properties', { [property]: !properties[property] });
	}

	return (
		<PropertiesStyles>
			{
				Object.keys(properties).map((property) => {
					// if we're not in edit mode, only show the checked values
					if (isEditMode || properties[property]) {
						return (
							<Checkbox key={ property } className={ (isEditMode) ? 'editable' : '' }>
								<label htmlFor={ property }>
									<input
										type="checkbox"
										id={ property }
										checked={ properties[property] }
										name={ `properties_${ property }` }
										onChange={ (e) => onPropertyChange(e, property) }
										// onKeyDown={ onKeyDown }
										value={ property }
									/>
									<span>{ property }</span>
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

Properties.defaultProps = { onChange: () => {} };

Properties.whyDidYouRender = true;

Properties.propTypes = {
	onChange: PropTypes.func,
	values: PropTypes.shape({ toJS: PropTypes.func }).isRequired,
};

export default withFieldSet(pure(Properties));

const PropertiesStyles = styled.div`
`;

const Checkbox = styled.div`
	display: inline-block;
	margin-right: 10px;
	color: #222;

	label {
		font-weight: 400 !important;
		position: relative;
		padding-left: 18px;

		input {
			background: tomato;
			margin-right: 8px;
			position: absolute;
			top: 0;
		  left: 0;
		  width: 0;
		  height: 0;
		  pointer-events: none;
			opacity: 0; /* we want to hide the original input, but maintain focus state */

			&:checked + span::after {
		    position: absolute;
		    top: 0;
				color: ${ (props) => props.theme.altGreen };
				display: block;
				font-style: normal;
				font-variant: normal;
				text-rendering: auto;
				-webkit-font-smoothing: antialiased;

				font-family: "Font Awesome 5 Pro";
				font-weight: 900;
				content: "\f00c";
		  }
		}
	}

	label::before {
	  display: block;
	  position: absolute;
	  top: 5px;
	  left: 0;
	  width: 11px;
	  height: 11px;
	  border-radius: 3px;
	  background-color: white;
	  border: 1px solid #aaa;
	  content: '';
	}

	&.editable > label {
		cursor: pointer;
	}

		/* apply fake focus highlighting */
	&.editable > input:focus + label::before {
    outline: ${ (props) => props.theme.altGreen } auto 3px;
	}
`;
