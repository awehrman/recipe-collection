import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

const ButtonLink = ({
	className,
	children,
	disabled,
	href,
	onClick,
	type,
	icon,
	label,
}) => (
	<Link href={ href }>
		{/* eslint-disable react/button-has-type */}
		<button
			className={ className }
			disabled={ disabled }
			onClick={ onClick }
			type={ type }
		>
			{ icon }
			{ label }
			{ children }
		</button>
	</Link>
);

ButtonLink.defaultProps = {
	className: null,
	children: null,
	disabled: false,
	icon: null,
	label: null,
	onClick: (e) => e.preventDefault(),
	type: 'button',
};

ButtonLink.propTypes = {
	className: PropTypes.string,
	children: PropTypes.shape({}),
	disabled: PropTypes.bool,
	href: PropTypes.string.isRequired,
	icon: PropTypes.element,
	label: PropTypes.string,
	onClick: PropTypes.func,
	type: PropTypes.string,
};

export default ButtonLink;
