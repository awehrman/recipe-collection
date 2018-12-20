import React from 'react';

const Button = (props) => (
	<button className={ props.className } type={ props.type } onClick={ props.onClick } id={ props.id } >
		{ props.icon }
		{ props.label }
	</button>
);

export default Button;