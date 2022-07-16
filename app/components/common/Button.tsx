import React, { forwardRef, MutableRefObject } from 'react';
import styled from 'styled-components';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	ref?: MutableRefObject<HTMLButtonElement>|null;
	icon?: React.ReactNode;
	label?: string;
}

type Ref = HTMLButtonElement|null;

const Button = forwardRef<Ref, ButtonProps>(({ icon, label, type = 'button', ...props}, ref) => (
	<StyledButton ref={ref} type={type} {...props}>
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
