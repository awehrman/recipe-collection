import React, { forwardRef, MutableRefObject } from 'react';
import styled from 'styled-components';
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	ref?: MutableRefObject<HTMLButtonElement>|null;
	icon?: React.ReactNode; // SVG
	label?: string;
}

// const Button: React.FC<ButtonProps> = ({ icon, label, ref, ...props }) => (
// 	<button ref={ref} {...props}>
// 		{icon }
// 		{label}
// 	</button>
// )

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
