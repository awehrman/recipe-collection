import { Component } from 'react';
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

	input {
		margin-right: 8px;
		position: absolute;
		top: 0;
	  left: 0;
	  width: 0;
	  height: 0;
	  pointer-events: none;
		opacity: 0; /* we want to hide the original input, but maintain focus state */

		&:checked + label::after {
	    display: block;
	    position: absolute;
	    top: 0;
	    font-family: "Font Awesome 5 Pro";
	    content: "\f00c";
	    font-weight: 900;
	    color: ${ props => props.theme.altGreen };
	  }
	}

	label {
		font-weight: 400 !important;
		position: relative;
		padding-left: 18px;
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
    outline: ${ props => props.theme.altGreen } auto 3px;
	}
`;

class CheckboxGroup extends Component {
	render() {
		let keys = [], values = [];
		const { checkboxes, className, isEditMode, loading, name, type } = this.props;

		for (let [ key, value ] of Object.entries(checkboxes)) {
			// strip out any prisma types
			if (key !== '__typename') {
				keys.push(key);
			}
			values.push(value);
		}

		return (
			<FieldSet aria-busy={ loading } className={ (isEditMode) ? `editable ${ className }` : className } disabled={ loading }>
				{
					keys.map((k, i) => {
						// if we're not in edit mode, only show the checked values
						if (isEditMode || values[i]) {
							return (
								<Checkbox key={ k } className={ (isEditMode) ? `editable ${ className }` : className }>
								  <input
								  	type={ type }
								  	id={ k }
								  	checked={ values[i] }
								  	onChange={ (isEditMode) ? e => this.props.onChange(e, name) : e => e.preventDefault() }
								  	onKeyDown={ (isEditMode) ? e => this.props.onKeyDown(e, name) : e => e.preventDefault() }
								  	value={ k }
								  />
								  <label htmlFor={ k }>{ k }</label>
								</Checkbox>
							);
						}
						return null;
					}).filter(c => c)
				}
			</FieldSet>
		);
	}
}

CheckboxGroup.defaultProps = {
	isEditMode: true,
	loading: false,
	type: "checkbox",
	onChange: () => {},
	onKeyDown: () => {},
};

CheckboxGroup.propTypes = {
	checkboxes: PropTypes.object.isRequired,
	className: PropTypes.string,
	isEditMode: PropTypes.bool,
	loading: PropTypes.bool,
	name: PropTypes.string,
	onChange: PropTypes.func.isRequired,
	onKeyDown: PropTypes.func,
	type: PropTypes.string,
};

export default CheckboxGroup;
