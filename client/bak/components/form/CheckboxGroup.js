import React from 'react';

const CheckboxGroup = (props) => (
	<React.Fragment>
		{
			props.options.map(option => {
				const checked = props.checkedOptions.indexOf(option) > -1;

				if (props.isEditMode || checked) {
					return (
						<div className="checkbox" key={ option }>
						  <input
						  	type={ props.type }
						  	id={ option }
						  	checked={ checked }
						  	onChange={ (props.isEditMode) ? props.onChange : (e) => { e.preventDefault(); } }
						  	value={ option }
						  />
						  <label htmlFor={ option }>{ option }</label>
						</div>
					);
				} return null;
			})
		}
	</React.Fragment>
);

export default CheckboxGroup;