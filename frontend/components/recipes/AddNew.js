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
	box-shadow: 0 0 10px 0 rgba(115, 198, 182, .2) inset;
  max-height: 90%;
  overflow-y: scroll;
	z-index: 600;

	*:focus {
		/* for whatever reason its not picking up a passed props.theme value here */
		outline: 2px dotted ${ props => props.theme.altGreen };
	}

	.add-new-btn {
		margin-bottom: 16px;

		&:focus {
			position: relative;
			padding: 4px;
			left: -4px;
			top: -4px;
			margin-bottom: 8px !important; /* 16px - whatever your padding is (8px) */
		}
	}

	&.slide {
		height: 50px;
		transition: all .3s ease;
	}

	&.slide_expanded {
		transition: all .3s ease;
	}

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
	constructor(props) {
		super(props);

		this.state = {
			isExpanded: false, // TEMP
			isFormReset: false,
		};
	}

	resetForm = () => {
		this.setState({
			isExpanded: false,
			isFormReset: true,
		});
	}

	onToggleAddNew = (e) => {
		e.preventDefault();
		const { isExpanded } = this.state;

		this.setState({ isExpanded: !isExpanded });
	}

	render() {
		const { isExpanded, isFormReset } = this.state;

		return (
			<AddNewStyles className={ `slide${ isExpanded ? '_expanded' : '' }` }>
				<Button
					className="add-new-btn"
					isEditMode
					label="Add New Recipe"
					onClick={ e => this.onToggleAddNew(e) }
				/>
				{
					(isExpanded)
						? (
							<Form
								className="add"
								isFormReset={ isFormReset }
								key="add-new"
								onSaveCallback={ this.resetForm }
								resetForm={ this.resetForm }
								saveLabel="Add"
							/>
						)
						: null
				}
			</AddNewStyles>
		);
	}
}

export default AddNew;
