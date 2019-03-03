import React from 'react';
import PropTypes from 'prop-types';

const Button = ({ className, disabled, onClick, type, icon, label }) => (
	// eslint-disable-next-line react/button-has-type
	<button
		className={ className }
		disabled={ disabled }
		onClick={ onClick }
		type={ type }
	>
		{ icon }
		{ label }
	</button>
);

Button.defaultProps = {
	className: null,
	disabled: false,
	icon: null,												// ex: <FontAwesomeIcon icon={ faPlus } />
	label: null,
	onClick: e => e.preventDefault(),
	type: 'button',
};

Button.propTypes = {
	className: PropTypes.string,
	disabled: PropTypes.bool,
	icon: PropTypes.element,					// ex: <FontAwesomeIcon icon={ faPlus } />
	label: PropTypes.string,
	onClick: PropTypes.func,
	type: PropTypes.arrayOf([ 'submit', 'button', 'reset' ]),
};

export default Button;
