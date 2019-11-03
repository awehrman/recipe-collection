import React from 'react';
import PropTypes from 'prop-types';
import Link from 'next/link';

const ButtonLink = ({
	className,
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
			{icon}
			{label}
		</button>
	</Link>
);

ButtonLink.defaultProps = {
	className: null,
	disabled: false,
	icon: null,
	label: null,
	onClick: (e) => e.preventDefault(),
	type: 'button',
};

ButtonLink.propTypes = {
	className: PropTypes.string,
	disabled: PropTypes.bool,
	href: PropTypes.string.isRequired,
	icon: PropTypes.element,
	label: PropTypes.string,
	onClick: PropTypes.func,
	type: PropTypes.string,
};

export default ButtonLink;
