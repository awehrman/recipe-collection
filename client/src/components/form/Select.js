import React, { Component } from 'react';

class Select extends Component {
	render() {
		const { label, fieldName, selected, placeholder, options } = this.props;

		return (
			<React.Fragment>
				{ (label) ? <label htmlFor={ fieldName }>{ label }</label> : null }
				<div className="placeholder">{ options[0].label }</div>
				<select
					name={ fieldName }
					value={ selected }
					onChange={ e => this.props.onChange(e) }
					>

					{
						(placeholder) ? <option value="">{ placeholder }</option> : null
					}

					{ options.map(opt => {
						return (
							<option key={ opt.code } value={ opt.code }>
								{ opt.label }
							</option>
						);
					}) }
				</select>
			</React.Fragment>
		);
	}
}

export default Select;