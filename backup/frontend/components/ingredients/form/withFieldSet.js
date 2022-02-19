import React from 'react';
import styled from 'styled-components';

/* TODO
	gurl, your styles are still a mess between this and your individual form components. this could still use some work.
*/
const FieldSet = (WrappedComponent) => ({
	children,
	loading,
	className,
	...props
}) => {
	const inputProps = {
		...props,
		className,
		loading,
	};

	return (
		<FieldSetStyles
			aria-busy={ loading }
			className={ className }
			disabled={ loading }
		>
			{/* eslint-disable-next-line react/jsx-props-no-spreading */}
			<WrappedComponent { ...inputProps }>
				{ children }
			</WrappedComponent>
		</FieldSetStyles>
	);
};

export default FieldSet;

const FieldSetStyles = styled.fieldset`
	position: relative;
	border: 0;
	padding: 0;

	&.properties {
		text-align: right;
	}

	&.isComposedIngredient {
		text-align: right;
	}

	&.hidden {
		display: none;
	}

	&.list {
		margin: 0 !important;
	}

	&.plural {
		height: 20px;
		margin-top: -10px;
	}

	// TODO this needs to be pulled out of fieldset component
	&.editable input {
		cursor: text;
		caret-color: #222;

		&:focus {
			/* disable the default dotted box borders since WE'RE USING SEXY UNDERLINES */
			outline: none !important;

			/* if there's no content in this field and the field has focus */
			& + span {
				/* TODO this needs to pull from Input props; for Cards this will need to be a lightened highlight or disabled */
				border-top: 3px solid #C3E7E0;
				max-width: auto;
				/* width: 100%; */
			}

			/* if there IS content in this field and the field has focus then only highlight the length of the text */
			& + span.enabled {
				border-top: 3px solid ${ (props) => props.theme.altGreen };
				/* max-width: 100% !important; */
				width: auto !important;
			}

			& + span.warning {
				border-top: 3px solid ${ (props) => props.theme.red };
			}
		}
	}
`;
