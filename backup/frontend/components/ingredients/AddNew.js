// import { Map as ImmutableMap } from 'immutable';
// import { useMutation, useQuery } from '@apollo/react-hooks';
// import PropTypes from 'prop-types';
// import React, { useContext } from 'react';
import pure from 'recompose/pure';
import styled from 'styled-components';
import Button from '../common/Button';

// TODO this needs to be updated again

const AddNew = () => (
	// className={ `slide${ isExpanded ? '_expanded' : '' }` }
	<AddNewStyles>
		<Button
			className="add-new-btn"
			isEditMode
			label="Add New Ingredient"
			// onClick={ (e) => this.onToggleAddNew(e) }
		/>
		{/*
			(isExpanded)
				? (
					<Form
						className="add"
						isFormReset={ isFormReset }
						key="add-new"
						onSaveCallback={ this.resetForm }
						resetForm={ this.resetForm }
						saveLabel="Add"
						view={ view }
					/>
				)
				: null
			*/}
	</AddNewStyles>
);

// AddNew.whyDidYouRender = true;

AddNew.propTypes = {};

export default pure(AddNew);

const AddNewStyles = styled.div`
	background: ${ (props) => props.theme.greenBackground };
	padding: 16px 40px 6px;
	position: fixed;
	bottom: 0;
	left: 0px;
	right: 0px;
	box-shadow: 0 0 10px 0 rgba(115, 198, 182, .2) inset;
  max-height: 60%;
  overflow-y: scroll;
	z-index: 600;

	*:focus {
		/* for whatever reason its not picking up a passed props.theme value here */
		outline: 2px dotted ${ (props) => props.theme.altGreen };
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
		color: ${ (props) => props.theme.altGreen };
		font-size: 16px;
		font-weight: 600;
		margin: 0 0 10px;
		padding: 0;

		.fa-plus {
			height: 18px;
			margin-right: 10px;
		}
	}

	@media (min-width: ${ (props) => props.theme.tablet }) {
		left: 40px;
	}
`;
