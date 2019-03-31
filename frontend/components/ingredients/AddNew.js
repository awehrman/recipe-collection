import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

import Button from '../form/Button';
import Form from './Form';

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
	z-index: 600;

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

class AddNew extends React.PureComponent {
	onAddIngredient = (e, ingredient = {}) => {
		console.warn('[AddNew] onAddIngredient');
		e.preventDefault();

		// TODO add mutation
	}

	render() {
		// console.warn('[AddNew] render');
		const { isExpanded, onClick } = this.props;

		return (
			<AddNewStyles>
				<Button
					isEditMode
					label="Add New Ingredient"
					onClick={ onClick }
				/>
				{
					(isExpanded)
						? (
							<Form
								key="add-new"
								onSaveIngredient={ this.onAddIngredient }
								saveLabel="Add"
							/>
						)
						: null
				}
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
