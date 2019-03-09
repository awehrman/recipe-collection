import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import Button from '../form/Button';

const AddNewStyles = styled.div`
	background: ${ props => props.theme.greenBackground };
	padding: 16px 40px 6px;
	position: fixed;
	bottom: 0;
	left: 0px;
	right: 0px;
	//box-shadow: 0 0 10px 0 rgba(50, 50, 50, .15) inset;
  max-height: 60%;
  overflow-y: scroll;
	z-index: 1000;

	button {
		cursor: pointer;
		border: 0;
		background: transparent;
		color: ${ props => props.theme.altGreen };
		font-size: 16px;
		font-weight: 600;
		margin: 0 0 10px;
		padding: 0;

		.fa-plus {
			height: 18px;
			margin-right: 10px;
		}
	}

	@media (min-width: ${ props => props.theme.tablet }) {
		left: 40px;
	}
`;

const IngredientForm = styled.form`
	position: relative;
	display: flex;
	flex-direction: column;
	flex-flow: column !important;

	fieldset {
		position: relative;
		margin: 0 0 26px;
		flex-basis: 100%;

		label {
			font-size: .875em;
	  	font-weight: 600;
	  	color: #222;
		}

		input:checked {
			+ label::after { top: 2px; }
		}
	}

	.create {
		span.highlight, span.warning {
		  top: 47px;
		}
	}

	fieldset.plural {
		height: 40px;

		label {
			display: block;
			margin-bottom: 4px;
		}

		span.highlight, span.warning {
		  top: 45px;
		}
	}

	.properties > .checkbox > label::after {
		top: 1px;
	}

	button {
		background: ${ props => props.theme.altGreen };
		border: 0;
		border-radius: 5px;
		padding: 10px 20px;
		color: white;
		text-transform: uppercase;
		font-weight: 600;
		font-size: 1.025em;
		cursor: pointer;

		&:disabled {
		  background: #ddd;
		  cursor: not-allowed;
		}
	}
`;

class AddNew extends React.PureComponent {
	render() {
		// console.warn('[AddNew] render');
		const { isExpanded, onClick } = this.props;

		return (
			<AddNewStyles>
				<IngredientForm>
					<Button
						label="Add New Ingredient"
						onClick={ onClick }
					/>
					{
						(isExpanded)
							? <div>TODO Card</div>
							: null
					}
				</IngredientForm>
			</AddNewStyles>
		);
	}
}

AddNew.defaultProps = {
	isExpanded: false,
	onClick: e => e.preventDefault(),
};

AddNew.propTypes = {
	isExpanded: PropTypes.bool,
	onClick: PropTypes.func,
};

export default AddNew;
