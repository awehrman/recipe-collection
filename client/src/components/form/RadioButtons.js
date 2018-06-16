import React from 'react';

const RadioButtons = (props) => (
	<div className={ `field ${props.className}` }>
		{ (props.label) ? <label>{ props.label }</label> : null }
		{
			props.options.map(option => {
				let checked = props.selectedOptions.indexOf(option) > -1;
				return (
					<div className="radio" key={ option }>
					  <input
					  	type={ props.type }
					  	id={ option }
					  	checked={ checked }
					  	onChange={ props.onChange }
					  	value={ option }
					  	/>
					  <label htmlFor={ option }>{ option }</label>
					</div>
				);
			})
		}
	</div>
);

export default RadioButtons;