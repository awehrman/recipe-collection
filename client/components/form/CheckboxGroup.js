import React, { Component } from 'react';

class CheckboxGroup extends Component {
	render() {
		const { className, isEditMode, options, type } = this.props;
		let keys = [], values = [];
		for (let [key, value] of Object.entries(options)) {
			keys.push(key);
			values.push(value);
		}

		return (
			<fieldset className={ className }>
				{
					keys.map((k, i) => {
						return (
							<div key={ k } className={ type }>
							  <input
							  	type={ type }
							  	id={ k }
							  	checked={ values[i] }
							  	onChange={ (isEditMode) ? this.props.onChange : e => { e.preventDefault(); } }
							  	value={ k }
							  />
							  <label htmlFor={ k }>{ k }</label>
							</div>
						);
					})
				}
			</fieldset>
		);
	}
}

export default CheckboxGroup;
