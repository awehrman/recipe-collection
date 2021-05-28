import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	icon?: React.ReactNode; // SVG
	label?: string;
}

const Button: React.FC<ButtonProps> = ({ icon, label, ...props }) => (
	<button {...props}>
		{icon }
		{label}
	</button>
)

Button.defaultProps = {
  type: 'button',
}

Button.displayName = 'Button';
export default Button;
