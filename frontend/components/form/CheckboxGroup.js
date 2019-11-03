import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const FieldSet = styled.fieldset`
	border: 0;
	padding: 0;
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

class CheckboxGroup extends Component {
	onChange = (e, fieldName) => {
		const { isEditMode, onChange } = this.props;

		if (isEditMode) {
			onChange(e, fieldName);
		} else {
			e.preventDefault();
		}
	}

	render() {
		const { className, isEditMode, keys, loading, fieldName, onKeyDown, type, values } = this.props;

		return (
			<FieldSet aria-busy={ loading } className={ (isEditMode) ? `editable ${ className }` : className } disabled={ loading }>
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
			</FieldSet>
		);
	}
}

CheckboxGroup.defaultProps = {
	className: null,
	isEditMode: true,
	loading: false,
	type: 'checkbox',
	onKeyDown: () => {},
};

CheckboxGroup.propTypes = {
	className: PropTypes.string,
	isEditMode: PropTypes.bool,
	fieldName: PropTypes.string.isRequired,
	keys: PropTypes.arrayOf(PropTypes.string).isRequired,
	loading: PropTypes.bool,
	onChange: PropTypes.func.isRequired,
	onKeyDown: PropTypes.func,
	type: PropTypes.string,
	values: PropTypes.arrayOf(PropTypes.bool).isRequired,
};

export default CheckboxGroup;
