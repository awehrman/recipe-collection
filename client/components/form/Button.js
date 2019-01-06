import PropTypes from 'prop-types';

const Button = (props) => (
	<button className={ props.className }
		 			disabled={ props.disabled }
					onClick={ props.onClick }
					type={ props.type }>
		{ props.icon }
		{ props.label }
	</button>
);

Button.defaultProps = {
	disabled: false,
	type: "button"
};

Button.propTypes = {
	className: PropTypes.string,
	disabled: PropTypes.bool,
	icon: PropTypes.element,					// ex: <FontAwesomeIcon icon={ faPlus } />
	label: PropTypes.string,
	onClick: PropTypes.func,
	type: PropTypes.string,
};

export default Button;