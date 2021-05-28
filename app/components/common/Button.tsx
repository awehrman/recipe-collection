import React, { forwardRef, MutableRefObject } from 'react';
import styled from 'styled-components';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	ref?: MutableRefObject<HTMLButtonElement>|null;
	href?: string;
	icon?: React.ReactNode; // SVG
	label?: string;
}

type Ref = HTMLButtonElement|null;

const Button = forwardRef<Ref, ButtonProps>(({ icon, label, ...props}, ref) => (
	<StyledButton ref={ref} {...props} >
		{icon}
		{label}
	</StyledButton>
));

const StyledButton = styled.button`
	pointer: cursor;
	text-decoration: none;
`;

Button.defaultProps = {
  type: 'button',
}

Button.displayName = 'Button';
export default Button;
