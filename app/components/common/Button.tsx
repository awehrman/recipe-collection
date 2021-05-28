import Link from 'next/link';
import React, { forwardRef, MutableRefObject } from 'react';
import styled from 'styled-components';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	ref?: MutableRefObject<HTMLButtonElement>|null;
	href?: string|null;
	icon?: React.ReactNode; // SVG
	label?: string;
}

type Ref = HTMLButtonElement|null;

const Button = forwardRef<Ref, ButtonProps>(({ href = null, icon, label, ...props}, ref) => {
	if (!href) {
		return (
			<StyledButton ref={ref} {...props} >
				{icon}
				{label}
			</StyledButton>
		);
	}

	console.log({ label, href });
	return (
		<Link href={href}>
			{label}
		</Link>
	);
})

const StyledButton = styled.button`
	pointer: cursor;
	text-decoration: none;
`;

Button.defaultProps = {
  type: 'button',
}

Button.displayName = 'Button';
export default Button;
