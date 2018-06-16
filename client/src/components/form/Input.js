import React from 'react';

const Input = (props) => (
	<input
		autoFocus={ props.autoFocus }
		className={ props.className }
		onBlur={ props.onBlur }
		onChange={ props.onChange }
		onClick={ props.onClick }
		onFocus={ props.onFocus }
		onKeyDown={ props.onKeyDown }
		placeholder={ props.placeholder }
		type={ props.type }
		value={ props.value }
	/>
);

export default Input;